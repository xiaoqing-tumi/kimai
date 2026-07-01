<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\API;

use App\API\Model\AttendanceImportResult;
use App\Attendance\AttendanceImportService;
use App\Entity\User;
use App\Repository\AttendanceRecordRepository;
use App\Repository\UserRepository;
use App\Form\API\AttendanceImportApiForm;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Request\ParamFetcherInterface;
use FOS\RestBundle\View\View;
use FOS\RestBundle\View\ViewHandlerInterface;
use OpenApi\Attributes as OA;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Constraints;

#[Route(path: '/attendance')]
#[IsGranted('API')]
#[OA\Tag(name: 'Attendance')]
final class AttendanceController extends BaseApiController
{
    public const GROUPS_ENTITY = ['Default', 'Entity', 'Attendance', 'Attendance_Entity', 'Not_Expanded'];
    public const GROUPS_COLLECTION = ['Default', 'Collection', 'Attendance', 'Not_Expanded'];
    public const GROUPS_FORM = ['Default', 'Entity', 'Attendance'];
    public const GROUPS_IMPORT = ['Default', 'Attendance_Import'];

    public function __construct(
        private readonly ViewHandlerInterface $viewHandler,
        private readonly AttendanceRecordRepository $repository,
        private readonly UserRepository $userRepository,
        private readonly AttendanceImportService $importService,
    ) {
    }

    /**
     * Fetch attendance records
     */
    #[IsGranted(new Expression("is_granted('view_own_timesheet') or is_granted('view_other_timesheet')"))]
    #[OA\Response(response: 200, description: 'Returns a collection of attendance records for the given user and date range.', content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/AttendanceEntity')))]
    #[Route(methods: ['GET'], path: '', name: 'get_attendance')]
    #[Rest\QueryParam(name: 'user', requirements: '\d+', strict: true, nullable: true, description: "User ID to filter records. Needs permission 'view_other_timesheet' (default: current user)")]
    #[Rest\QueryParam(name: 'begin', requirements: [new Constraints\Date()], strict: true, nullable: true, description: 'Only records on or after this date (format: YYYY-MM-DD)')]
    #[Rest\QueryParam(name: 'end', requirements: [new Constraints\Date()], strict: true, nullable: true, description: 'Only records on or before this date (format: YYYY-MM-DD)')]
    public function cgetAction(ParamFetcherInterface $paramFetcher): Response
    {
        $currentUser = $this->getUser();
        $profile = $currentUser;

        $userId = $paramFetcher->get('user');
        if (\is_string($userId) && $userId !== '') {
            if (!$this->isGranted('view_other_timesheet')) {
                throw $this->createAccessDeniedException('Cannot access other users attendance');
            }

            $selected = $this->userRepository->find((int) $userId);
            if (!$selected instanceof User) {
                throw $this->createNotFoundException('Unknown user');
            }

            if (!$this->isGranted('access_user', $selected)) {
                throw $this->createAccessDeniedException('Cannot access user: ' . $selected->getId());
            }

            $profile = $selected;
        }

        $factory = $this->getDateTimeFactory($profile);
        $begin = $factory->getStartOfMonth();
        $end = $factory->getEndOfMonth($begin);

        $beginParam = $paramFetcher->get('begin');
        if (\is_string($beginParam) && $beginParam !== '') {
            $begin = $factory->createDateTime($beginParam);
            $begin->setTime(0, 0, 0);
        }

        $endParam = $paramFetcher->get('end');
        if (\is_string($endParam) && $endParam !== '') {
            $end = $factory->createDateTime($endParam);
            $end->setTime(23, 59, 59);
        }

        if ($begin > $end) {
            throw $this->createNotFoundException('Invalid date range');
        }

        $records = $this->repository->findForUserInRange($profile, $begin, $end);

        $view = new View($records, 200);
        $view->getContext()->setGroups(self::GROUPS_COLLECTION);

        return $this->viewHandler->handle($view);
    }

    /**
     * Import attendance records
     */
    #[OA\Post(
        description: 'Imports or updates attendance records for a user. Existing records for the same date are updated.',
        responses: [new OA\Response(response: 200, description: 'Number of imported records', content: new OA\JsonContent(ref: '#/components/schemas/AttendanceImportResult'))]
    )]
    #[OA\RequestBody(required: true, content: new OA\JsonContent(ref: '#/components/schemas/AttendanceImportForm'))]
    #[Route(methods: ['POST'], path: '/import', name: 'post_attendance_import')]
    public function importAction(Request $request): Response
    {
        $form = $this->createForm(AttendanceImportApiForm::class);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            $view = new View($form, Response::HTTP_BAD_REQUEST);
            $view->getContext()->setGroups(self::GROUPS_FORM);

            return $this->viewHandler->handle($view);
        }

        $currentUser = $this->getUser();
        $profile = $currentUser;

        $userId = $form->get('user')->getData();
        if ($userId !== null) {
            if (!$this->isGranted('edit_other_timesheet')) {
                throw $this->createAccessDeniedException('Cannot import attendance for other users');
            }

            $selected = $this->userRepository->find((int) $userId);
            if (!$selected instanceof User) {
                throw $this->createNotFoundException('Unknown user');
            }

            if (!$this->isGranted('access_user', $selected)) {
                throw $this->createAccessDeniedException('Cannot access user: ' . $selected->getId());
            }

            $profile = $selected;
        } elseif (!$this->isGranted('view_own_timesheet')) {
            throw $this->createAccessDeniedException('Cannot import attendance');
        }

        /** @var array<int, array{date: string, clock_in?: ?string, clock_out?: ?string, external_id?: ?string}> $records */
        $records = $form->get('records')->getData();
        $source = $form->get('source')->getData();
        if (!\is_string($source) || $source === '') {
            $source = 'external';
        }

        $imported = $this->importService->importForUser($profile, $records, $source);
        $result = new AttendanceImportResult($imported);

        $view = new View($result, 200);
        $view->getContext()->setGroups(self::GROUPS_IMPORT);

        return $this->viewHandler->handle($view);
    }
}

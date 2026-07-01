<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Controller;

use App\Attendance\AttendanceCalendarBuilder;
use App\Attendance\AttendanceImportService;
use App\Entity\User;
use App\Form\AttendanceByUserForm;
use App\Reporting\MonthByUser\MonthByUser;
use App\Repository\AttendanceRecordRepository;
use App\Repository\UserRepository;
use App\Utils\PageSetup;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Displays and imports external attendance (clock-in) records.
 */
#[Route(path: '/attendance')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class AttendanceController extends AbstractController
{
    public function __construct(
        private readonly AttendanceRecordRepository $attendanceRecordRepository,
        private readonly UserRepository $userRepository,
        private readonly AttendanceImportService $attendanceImportService,
        private readonly AttendanceCalendarBuilder $attendanceCalendarBuilder,
    ) {
    }

    #[Route(path: '/', name: 'attendance', methods: ['GET'])]
    public function indexAction(Request $request): Response
    {
        $currentUser = $this->getUser();
        $dateTimeFactory = $this->getDateTimeFactory($currentUser);
        $canViewOthers = $this->isGranted('view_other_timesheet');

        $values = new MonthByUser();
        $values->setUser($currentUser);
        $values->setDate($dateTimeFactory->getStartOfMonth());

        $form = $this->createFormForGetRequest(AttendanceByUserForm::class, $values, [
            'include_user' => $canViewOthers,
            'timezone' => $dateTimeFactory->getTimezone()->getName(),
            'start_date' => $values->getDate(),
        ]);

        $form->submit($request->query->all(), false);

        if ($values->getUser() === null) {
            $values->setUser($currentUser);
        }

        /** @var User $profile */
        $profile = $values->getUser();

        if ($currentUser !== $profile && !$canViewOthers) {
            throw new AccessDeniedException('User is not allowed to see other users attendance');
        }

        $profileFactory = $this->getDateTimeFactory($profile);

        if ($values->getDate() === null) {
            $values->setDate($profileFactory->getStartOfMonth());
        }

        $monthStart = $profileFactory->getStartOfMonth($values->getDate());
        $monthEnd = $profileFactory->getEndOfMonth($monthStart);

        $records = $this->attendanceRecordRepository->findForUserInRange($profile, $monthStart, $monthEnd);
        $calendar = $this->attendanceCalendarBuilder->buildMonthView($profileFactory, $monthStart, $monthEnd, $records);

        $page = new PageSetup('attendance.title');
        $page->setActionName('attendance');
        $page->setPaginationForm($form);

        return $this->render('attendance/index.html.twig', [
            'page_setup' => $page,
            'records' => $records,
            'profile' => $profile,
            'month_start' => $monthStart,
            'calendar' => $calendar,
        ]);
    }

    #[Route(path: '/import', name: 'attendance_import', methods: ['POST'])]
    #[IsGranted('role:ROLE_SUPER_ADMIN')]
    public function importAction(Request $request): Response
    {
        $userId = $request->request->getInt('user');
        $user = $this->userRepository->find($userId);
        if (!$user instanceof User) {
            $this->flashError('action.update.error');

            return $this->redirectToRoute('attendance');
        }

        $payload = $request->request->all('records');
        if (!\is_array($payload)) {
            $payload = [];
        }

        $source = $request->request->getString('source', 'external');
        $count = $this->attendanceImportService->importForUser($user, $payload, $source);

        $this->flashSuccess('action.update.success');

        return $this->redirectToRoute('attendance', ['user' => $user->getId()]);
    }
}

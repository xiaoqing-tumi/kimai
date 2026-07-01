<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Controller;

use App\Attendance\AttendanceImportService;
use App\Entity\User;
use App\Repository\AttendanceRecordRepository;
use App\Repository\UserRepository;
use App\Utils\PageSetup;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
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
    ) {
    }

    #[Route(path: '/', name: 'attendance', methods: ['GET'])]
    public function indexAction(Request $request): Response
    {
        $currentUser = $this->getUser();
        $dateTimeFactory = $this->getDateTimeFactory($currentUser);
        $canViewOthers = $this->isGranted('view_other_timesheet');

        $begin = $dateTimeFactory->getStartOfWeek($dateTimeFactory->createDateTime());
        $end = $dateTimeFactory->getEndOfWeek($begin);

        $profile = $currentUser;
        if ($canViewOthers) {
            $userId = $request->query->getInt('user');
            if ($userId > 0) {
                $selected = $this->userRepository->find($userId);
                if ($selected instanceof User) {
                    $profile = $selected;
                }
            }
        }

        $dateParam = $request->query->get('date');
        if (\is_string($dateParam) && $dateParam !== '') {
            try {
                $parsed = $dateTimeFactory->createDateTime($dateParam);
                $begin = $dateTimeFactory->getStartOfWeek($parsed);
                $end = $dateTimeFactory->getEndOfWeek($begin);
            } catch (\Exception) {
            }
        }

        $records = $this->attendanceRecordRepository->findForUserInRange($profile, $begin, $end);

        $page = new PageSetup('attendance.title');
        $page->setActionName('attendance');

        return $this->render('attendance/index.html.twig', [
            'page_setup' => $page,
            'records' => $records,
            'profile' => $profile,
            'week_begin' => $begin,
            'week_end' => $end,
            'can_view_others' => $canViewOthers,
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

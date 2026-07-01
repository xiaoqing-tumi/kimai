<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Timesheet\Shift;

use App\Configuration\SystemConfiguration;
use App\Entity\User;
use App\Repository\AttendanceRecordRepository;
use App\Timesheet\Shift\ShiftFromClockIn;

final class ShiftResolver implements ShiftResolverInterface
{
    public const USER_PREFERENCE_DEFAULT_SHIFT = 'default_shift';

    public function __construct(
        private readonly AttendanceRecordRepository $attendanceRecordRepository,
        private readonly SystemConfiguration $configuration,
    ) {
    }

    public function resolve(User $user, \DateTimeInterface $date): ShiftTemplate
    {
        $lunchBreak = $this->configuration->getShiftLunchBreakSeconds();
        $record = $this->attendanceRecordRepository->findForUserAndDate($user, $date);

        if ($record !== null && $record->getClockIn() !== null) {
            return $this->resolveFromClockIn($record->getClockIn(), $user, $lunchBreak);
        }

        $preference = $user->getPreferenceValue(self::USER_PREFERENCE_DEFAULT_SHIFT, ShiftTemplate::SHIFT_A);
        if (!\is_string($preference)) {
            $preference = ShiftTemplate::SHIFT_A;
        }

        return ShiftTemplate::fromId($preference, $lunchBreak);
    }

    private function resolveFromClockIn(\DateTimeInterface $clockIn, User $user, int $lunchBreakSeconds): ShiftTemplate
    {
        $shiftId = ShiftFromClockIn::resolveShiftId($clockIn, $user->getTimezone());

        return ShiftTemplate::fromId($shiftId, $lunchBreakSeconds);
    }
}

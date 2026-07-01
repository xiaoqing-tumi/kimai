<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Attendance;

use App\Entity\AttendanceRecord;
use App\Entity\User;
use App\Timesheet\DateTimeFactory;
use App\Timesheet\Shift\ShiftFromClockIn;
use App\Timesheet\Shift\ShiftTemplate;

/**
 * Builds realistic demo attendance records aligned with shift A/B rules.
 */
final class DemoAttendanceGenerator
{
    public const DEMO_SOURCE = 'demo';

    public function createRecord(User $user, \DateTimeImmutable $day, \DateTime $syncedAt, ?bool $shiftA = null): AttendanceRecord
    {
        $factory = DateTimeFactory::createByUser($user);
        $date = $day->format('Y-m-d');
        $shiftA ??= random_int(0, 1) === 1;

        if ($shiftA) {
            $clockInMinutes = (9 * 60) + random_int(-5, -1);
            $clockOutMinutes = (18 * 60) + random_int(-2, 2);
        } else {
            $clockInMinutes = (9 * 60) + 30 + random_int(-2, 2);
            $clockOutMinutes = (18 * 60) + 30 + random_int(-2, 2);
        }

        $clockIn = $this->createDateTimeFromMinutes($factory, $date, $clockInMinutes);
        $clockOut = $this->createDateTimeFromMinutes($factory, $date, $clockOutMinutes);

        $record = new AttendanceRecord();
        $record->setUser($user);
        $record->setDate($day);
        $record->setClockIn($clockIn);
        $record->setClockOut($clockOut);
        $record->setExternalSource(self::DEMO_SOURCE);
        $record->setExternalId(\sprintf('demo-%d-%s', $user->getId(), $date));
        $record->setSyncedAt($syncedAt);

        $expectedShift = $shiftA ? ShiftTemplate::SHIFT_A : ShiftTemplate::SHIFT_B;
        if (ShiftFromClockIn::resolveShiftId($clockIn, $user->getTimezone()) !== $expectedShift) {
            throw new \LogicException('Generated demo attendance does not match shift rules');
        }

        return $record;
    }

    private function createDateTimeFromMinutes(DateTimeFactory $factory, string $date, int $minutesFromMidnight): \DateTime
    {
        $hours = intdiv($minutesFromMidnight, 60);
        $minutes = $minutesFromMidnight % 60;
        $clock = $factory->createDateTimeFromFormat(
            'Y-m-d H:i:s',
            \sprintf('%s %02d:%02d:%02d', $date, $hours, $minutes, random_int(0, 59))
        );

        if ($clock === false) {
            throw new \InvalidArgumentException('Could not build demo attendance times');
        }

        return $clock;
    }
}

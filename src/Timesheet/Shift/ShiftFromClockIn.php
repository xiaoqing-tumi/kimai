<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Timesheet\Shift;

/**
 * Resolves shift A/B from a clock-in time in the user's timezone.
 *
 * Shift A: clock-in before 09:00
 * Shift B: clock-in at or after 09:00
 */
final class ShiftFromClockIn
{
    private const THRESHOLD_MINUTES = 9 * 60;

    public static function resolveShiftId(\DateTimeInterface $clockIn, string $timezone): string
    {
        $local = \DateTimeImmutable::createFromInterface($clockIn)->setTimezone(new \DateTimeZone($timezone));
        $minutes = ((int) $local->format('H') * 60) + (int) $local->format('i');

        return $minutes < self::THRESHOLD_MINUTES ? ShiftTemplate::SHIFT_A : ShiftTemplate::SHIFT_B;
    }
}

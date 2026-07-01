<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Timesheet\Shift;

/**
 * Defines begin/end times and lunch break for a work shift.
 */
final class ShiftTemplate
{
    public const SHIFT_A = 'A';
    public const SHIFT_B = 'B';
    public const FULL_DAY_NET_SECONDS = 28800;

    private function __construct(
        private readonly string $id,
        private readonly string $beginTime,
        private readonly string $endTime,
        private readonly int $lunchBreakSeconds,
    ) {
    }

    public static function shiftA(int $lunchBreakSeconds = 3600): self
    {
        return new self(self::SHIFT_A, '09:00', '18:00', $lunchBreakSeconds);
    }

    public static function shiftB(int $lunchBreakSeconds = 3600): self
    {
        return new self(self::SHIFT_B, '09:30', '18:30', $lunchBreakSeconds);
    }

    public static function fromId(string $id, int $lunchBreakSeconds = 3600): self
    {
        return $id === self::SHIFT_B ? self::shiftB($lunchBreakSeconds) : self::shiftA($lunchBreakSeconds);
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getBeginTime(): string
    {
        return $this->beginTime;
    }

    public function getEndTime(): string
    {
        return $this->endTime;
    }

    public function getLunchBreakSeconds(): int
    {
        return $this->lunchBreakSeconds;
    }

    public function getFullDayNetSeconds(): int
    {
        return self::FULL_DAY_NET_SECONDS;
    }
}

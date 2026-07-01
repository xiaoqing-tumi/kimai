<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Timesheet\Shift;

use App\Entity\Timesheet;

/**
 * Maps net duration to begin/end/break using a shift template.
 */
final class ShiftTimeCalculator
{
    public function applyNetDuration(Timesheet $timesheet, ShiftTemplate $shift): void
    {
        $netDuration = $timesheet->getDuration(false);

        if ($netDuration === null) {
            $timesheet->setDuration(null);

            return;
        }

        $begin = $timesheet->getBegin();
        if ($begin === null) {
            return;
        }

        $day = \DateTime::createFromInterface($begin);
        $day->setTime(0, 0, 0);

        if ($netDuration === $shift->getFullDayNetSeconds()) {
            $this->applyFullDay($timesheet, $shift, $day);

            return;
        }

        $this->applyPartialDay($timesheet, $shift, $day, $netDuration);
    }

    private function applyFullDay(Timesheet $timesheet, ShiftTemplate $shift, \DateTime $day): void
    {
        $begin = clone $day;
        $this->setTimeFromString($begin, $shift->getBeginTime());

        $end = clone $day;
        $this->setTimeFromString($end, $shift->getEndTime());

        $timesheet->setBegin($begin);
        $timesheet->setEnd($end);
        $timesheet->setBreak($shift->getLunchBreakSeconds());
    }

    private function applyPartialDay(Timesheet $timesheet, ShiftTemplate $shift, \DateTime $day, int $netDuration): void
    {
        $begin = clone $day;
        $this->setTimeFromString($begin, $shift->getBeginTime());

        $end = clone $begin;
        $end->modify('+ ' . $netDuration . ' seconds');

        $timesheet->setBegin($begin);
        $timesheet->setEnd($end);
        $timesheet->setBreak(0);
    }

    /**
     * Applies a full shift day template (begin, end, break, duration) for manual timesheet entry.
     */
    public function applyFullShiftDay(Timesheet $timesheet, ShiftTemplate $shift): void
    {
        $begin = $timesheet->getBegin() ?? new \DateTime();
        $day = \DateTime::createFromInterface($begin);
        $day->setTime(0, 0, 0);

        $this->applyFullDay($timesheet, $shift, $day);
        $timesheet->setDuration($shift->getFullDayNetSeconds());
    }

    private function setTimeFromString(\DateTime $date, string $time): void
    {
        $parts = explode(':', $time);
        $date->setTime((int) ($parts[0] ?? 0), (int) ($parts[1] ?? 0), 0);
    }
}

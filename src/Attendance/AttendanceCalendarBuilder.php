<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Attendance;

use App\Entity\AttendanceRecord;
use App\Timesheet\DateTimeFactory;

/**
 * Builds a month calendar grid for attendance records.
 */
final class AttendanceCalendarBuilder
{
    /**
     * @param AttendanceRecord[] $records
     *
     * @return array{
     *     weeks: list<list<array{date: \DateTime, inMonth: bool, record: AttendanceRecord|null}>>,
     *     weekdayHeaders: list<\DateTime>,
     *     summary: array{total: int, shiftA: int, shiftB: int}
     * }
     */
    public function buildMonthView(
        DateTimeFactory $factory,
        \DateTimeInterface $monthStart,
        \DateTimeInterface $monthEnd,
        array $records,
    ): array {
        $recordsByDate = [];
        foreach ($records as $record) {
            $date = $record->getDate();
            if ($date === null) {
                continue;
            }
            $recordsByDate[$date->format('Y-m-d')] = $record;
        }

        $monthKey = $monthStart->format('Y-m');
        $gridStart = $factory->getStartOfWeek($monthStart);
        $gridEnd = $factory->getEndOfWeek($monthEnd);

        $weeks = [];
        $currentWeek = [];
        $day = clone $gridStart;

        while ($day <= $gridEnd) {
            $dateKey = $day->format('Y-m-d');
            $currentWeek[] = [
                'date' => clone $day,
                'inMonth' => $day->format('Y-m') === $monthKey,
                'record' => $recordsByDate[$dateKey] ?? null,
            ];

            if (\count($currentWeek) === 7) {
                $weeks[] = $currentWeek;
                $currentWeek = [];
            }

            $day = $day->modify('+1 day');
        }

        $summary = [
            'total' => 0,
            'shiftA' => 0,
            'shiftB' => 0,
        ];

        foreach ($records as $record) {
            $summary['total']++;
            $shiftId = $record->getResolvedShiftId();
            if ($shiftId === 'A') {
                $summary['shiftA']++;
            } elseif ($shiftId === 'B') {
                $summary['shiftB']++;
            }
        }

        $weekdayHeaders = [];
        $headerDay = $factory->getStartOfWeek($monthStart);
        for ($i = 0; $i < 7; $i++) {
            $weekdayHeaders[] = (clone $headerDay)->modify('+' . $i . ' days');
        }

        return [
            'weeks' => $weeks,
            'weekdayHeaders' => $weekdayHeaders,
            'summary' => $summary,
        ];
    }
}

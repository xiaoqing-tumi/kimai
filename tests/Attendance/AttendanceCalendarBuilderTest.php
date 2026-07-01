<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Attendance;

use App\Attendance\AttendanceCalendarBuilder;
use App\Entity\AttendanceRecord;
use App\Entity\User;
use App\Timesheet\DateTimeFactory;
use PHPUnit\Framework\TestCase;

final class AttendanceCalendarBuilderTest extends TestCase
{
    public function testBuildMonthView(): void
    {
        $user = new User();
        $factory = DateTimeFactory::createByUser($user);
        $builder = new AttendanceCalendarBuilder();

        $monthStart = $factory->getStartOfMonth('2026-06-01');
        $monthEnd = $factory->getEndOfMonth($monthStart);

        $record = new AttendanceRecord();
        $record->setUser($user);
        $record->setDate(new \DateTimeImmutable('2026-06-29'));
        $record->setClockIn(new \DateTime('2026-06-29 08:30:00'));

        $view = $builder->buildMonthView($factory, $monthStart, $monthEnd, [$record]);

        self::assertCount(7, $view['weekdayHeaders']);
        self::assertGreaterThanOrEqual(4, \count($view['weeks']));
        self::assertSame(1, $view['summary']['total']);
        self::assertSame(1, $view['summary']['shiftA']);
        self::assertSame(0, $view['summary']['shiftB']);

        $found = false;
        foreach ($view['weeks'] as $week) {
            foreach ($week as $day) {
                if ($day['date']->format('Y-m-d') === '2026-06-29') {
                    self::assertTrue($day['inMonth']);
                    self::assertSame($record, $day['record']);
                    $found = true;
                }
            }
        }

        self::assertTrue($found);
    }

    public function testBuildMonthViewIncludesOutsideDays(): void
    {
        $user = new User();
        $factory = DateTimeFactory::createByUser($user);
        $builder = new AttendanceCalendarBuilder();

        $monthStart = $factory->getStartOfMonth('2026-06-01');
        $monthEnd = $factory->getEndOfMonth($monthStart);

        $view = $builder->buildMonthView($factory, $monthStart, $monthEnd, []);

        $outsideDays = 0;
        $insideDays = 0;
        foreach ($view['weeks'] as $week) {
            foreach ($week as $day) {
                if ($day['inMonth']) {
                    $insideDays++;
                } else {
                    $outsideDays++;
                }
            }
        }

        self::assertSame(30, $insideDays);
        self::assertGreaterThan(0, $outsideDays);
    }
}

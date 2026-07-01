<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Attendance;

use App\Attendance\DemoAttendanceGenerator;
use App\Entity\User;
use App\Timesheet\Shift\ShiftTemplate;
use PHPUnit\Framework\TestCase;

final class DemoAttendanceGeneratorTest extends TestCase
{
    public function testCreateShiftARecord(): void
    {
        $user = new User();
        $user->setTimezone('Asia/Shanghai');

        $generator = new DemoAttendanceGenerator();
        $record = $generator->createRecord(
            $user,
            new \DateTimeImmutable('2026-06-03'),
            new \DateTime(),
            true
        );

        self::assertSame(ShiftTemplate::SHIFT_A, $record->getResolvedShiftId());
        self::assertSame('2026-06-03', $record->getClockIn()?->format('Y-m-d'));
        self::assertSame('2026-06-03', $record->getClockOut()?->format('Y-m-d'));
        self::assertGreaterThanOrEqual(8, (int) $record->getClockIn()?->format('H'));
        self::assertLessThan(9, (int) $record->getClockIn()?->format('H'));
        self::assertGreaterThanOrEqual(17, (int) $record->getClockOut()?->format('H'));
        self::assertLessThanOrEqual(19, (int) $record->getClockOut()?->format('H'));
    }

    public function testCreateShiftBRecord(): void
    {
        $user = new User();
        $user->setTimezone('Asia/Shanghai');

        $generator = new DemoAttendanceGenerator();
        $record = $generator->createRecord(
            $user,
            new \DateTimeImmutable('2026-06-04'),
            new \DateTime(),
            false
        );

        self::assertSame(ShiftTemplate::SHIFT_B, $record->getResolvedShiftId());
        self::assertSame('2026-06-04', $record->getClockIn()?->format('Y-m-d'));
        self::assertSame('2026-06-04', $record->getClockOut()?->format('Y-m-d'));
        self::assertGreaterThanOrEqual(9, (int) $record->getClockIn()?->format('H'));
        self::assertLessThanOrEqual(10, (int) $record->getClockIn()?->format('H'));
        self::assertGreaterThanOrEqual(18, (int) $record->getClockOut()?->format('H'));
    }
}

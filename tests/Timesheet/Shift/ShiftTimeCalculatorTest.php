<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Timesheet\Shift;

use App\Entity\Timesheet;
use App\Entity\User;
use App\Timesheet\Shift\ShiftTemplate;
use App\Timesheet\Shift\ShiftTimeCalculator;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(ShiftTimeCalculator::class)]
final class ShiftTimeCalculatorTest extends TestCase
{
    public function testApplyFullDayShiftA(): void
    {
        $timesheet = new Timesheet();
        $timesheet->setUser(new User());
        $timesheet->setBegin(new \DateTime('2026-06-30 07:00:00'));
        $timesheet->setDuration(28800);

        $sut = new ShiftTimeCalculator();
        $sut->applyNetDuration($timesheet, ShiftTemplate::shiftA());

        self::assertEquals('09:00', $timesheet->getBegin()->format('H:i'));
        self::assertEquals('18:00', $timesheet->getEnd()->format('H:i'));
        self::assertEquals(3600, $timesheet->getBreak());
        self::assertEquals(28800, $timesheet->getDuration(false));
    }

    public function testApplyPartialDay(): void
    {
        $timesheet = new Timesheet();
        $timesheet->setUser(new User());
        $timesheet->setBegin(new \DateTime('2026-06-30 07:00:00'));
        $timesheet->setDuration(14400);

        $sut = new ShiftTimeCalculator();
        $sut->applyNetDuration($timesheet, ShiftTemplate::shiftB());

        self::assertEquals('09:30', $timesheet->getBegin()->format('H:i'));
        self::assertEquals('13:30', $timesheet->getEnd()->format('H:i'));
        self::assertEquals(0, $timesheet->getBreak());
    }
}

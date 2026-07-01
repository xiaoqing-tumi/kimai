<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Timesheet\Shift;

use App\Timesheet\Shift\ShiftFromClockIn;
use App\Timesheet\Shift\ShiftTemplate;
use PHPUnit\Framework\TestCase;

final class ShiftFromClockInTest extends TestCase
{
    public function testResolveShiftA(): void
    {
        $clockIn = new \DateTime('2026-06-03 08:50:00', new \DateTimeZone('Asia/Shanghai'));

        self::assertSame(ShiftTemplate::SHIFT_A, ShiftFromClockIn::resolveShiftId($clockIn, 'Asia/Shanghai'));
    }

    public function testResolveShiftBAtNine(): void
    {
        $clockIn = new \DateTime('2026-06-03 09:00:00', new \DateTimeZone('Asia/Shanghai'));

        self::assertSame(ShiftTemplate::SHIFT_B, ShiftFromClockIn::resolveShiftId($clockIn, 'Asia/Shanghai'));
    }

    public function testResolveShiftBWhenStoredAsUtc(): void
    {
        $clockIn = new \DateTime('2026-06-03 01:00:00', new \DateTimeZone('UTC'));

        self::assertSame(ShiftTemplate::SHIFT_B, ShiftFromClockIn::resolveShiftId($clockIn, 'Asia/Shanghai'));
    }
}

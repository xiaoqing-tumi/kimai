<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Timesheet\Shift;

use App\Configuration\SystemConfiguration;
use App\Entity\AttendanceRecord;
use App\Entity\User;
use App\Repository\AttendanceRecordRepository;
use App\Timesheet\Shift\ShiftResolver;
use App\Timesheet\Shift\ShiftTemplate;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(ShiftResolver::class)]
final class ShiftResolverTest extends TestCase
{
    public function testResolveFromAttendanceBeforeNine(): void
    {
        $user = new User();
        $user->setTimezone('Asia/Shanghai');
        $date = new \DateTime('2026-06-30');

        $record = new AttendanceRecord();
        $record->setUser($user);
        $record->setDate(new \DateTimeImmutable('2026-06-30'));
        $record->setClockIn(new \DateTime('2026-06-30 08:45:00', new \DateTimeZone('Asia/Shanghai')));

        $repository = $this->createMock(AttendanceRecordRepository::class);
        $repository->method('findForUserAndDate')->willReturn($record);

        $configuration = $this->createMock(SystemConfiguration::class);
        $configuration->method('getShiftLunchBreakSeconds')->willReturn(3600);

        $sut = new ShiftResolver($repository, $configuration);
        $shift = $sut->resolve($user, $date);

        self::assertEquals(ShiftTemplate::SHIFT_A, $shift->getId());
    }

    public function testResolveFromAttendanceAfterNineInUserTimezone(): void
    {
        $user = new User();
        $user->setTimezone('Asia/Shanghai');
        $date = new \DateTime('2026-06-30');

        $record = new AttendanceRecord();
        $record->setUser($user);
        $record->setDate(new \DateTimeImmutable('2026-06-30'));
        $record->setClockIn(new \DateTime('2026-06-30 01:00:00', new \DateTimeZone('UTC')));

        $repository = $this->createMock(AttendanceRecordRepository::class);
        $repository->method('findForUserAndDate')->willReturn($record);

        $configuration = $this->createMock(SystemConfiguration::class);
        $configuration->method('getShiftLunchBreakSeconds')->willReturn(3600);

        $sut = new ShiftResolver($repository, $configuration);
        $shift = $sut->resolve($user, $date);

        self::assertEquals(ShiftTemplate::SHIFT_B, $shift->getId());
    }

    public function testResolveFromUserPreferenceWhenNoAttendance(): void
    {
        $user = new User();
        $user->setPreferenceValue(ShiftResolver::USER_PREFERENCE_DEFAULT_SHIFT, 'B');

        $repository = $this->createMock(AttendanceRecordRepository::class);
        $repository->method('findForUserAndDate')->willReturn(null);

        $configuration = $this->createMock(SystemConfiguration::class);
        $configuration->method('getShiftLunchBreakSeconds')->willReturn(3600);

        $sut = new ShiftResolver($repository, $configuration);
        $shift = $sut->resolve($user, new \DateTime('2026-06-30'));

        self::assertEquals(ShiftTemplate::SHIFT_B, $shift->getId());
    }
}

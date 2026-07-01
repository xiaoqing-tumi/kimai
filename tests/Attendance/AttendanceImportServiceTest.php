<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Attendance;

use App\Attendance\AttendanceImportService;
use App\Entity\User;
use App\Repository\AttendanceRecordRepository;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(AttendanceImportService::class)]
final class AttendanceImportServiceTest extends TestCase
{
    public function testImportCreatesRecord(): void
    {
        $user = new User();
        $repository = $this->createMock(AttendanceRecordRepository::class);
        $repository->method('findForUserAndDate')->willReturn(null);
        $repository->expects(self::once())->method('save');

        $sut = new AttendanceImportService($repository);
        $count = $sut->importForUser($user, [
            ['date' => '2026-06-30', 'clock_in' => '2026-06-30 08:50:00', 'clock_out' => '2026-06-30 18:05:00'],
        ], 'test');

        self::assertEquals(1, $count);
    }
}

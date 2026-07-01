<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Model;

use App\Entity\User;
use App\Model\QuickEntryModel;
use App\Model\QuickEntryWeek;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;

#[CoversClass(QuickEntryWeek::class)]
class QuickEntryWeekTest extends TestCase
{
    public function testModel(): void
    {
        $date = new \DateTime();

        $sut = new QuickEntryWeek($date);
        self::assertSame($date, $sut->getDate());
        self::assertEquals([], $sut->getRows());

        $rows = [
            new QuickEntryModel(new User())
        ];

        $sut->setRows($rows);
        self::assertSame($rows, $sut->getRows());
        self::assertFalse($sut->hasRowsWithExistingTimesheets());
    }

    public function testHasRowsWithExistingTimesheets(): void
    {
        $user = new User();
        $sut = new QuickEntryWeek(new \DateTime());

        $emptyRow = new QuickEntryModel($user);
        $sut->setRows([$emptyRow]);
        self::assertFalse($sut->hasRowsWithExistingTimesheets());

        $timesheet = new \App\Entity\Timesheet();
        $timesheet->setUser($user);
        $timesheet->setBegin(new \DateTime());
        $timesheet->setEnd(new \DateTime());
        $idProperty = new \ReflectionProperty(\App\Entity\Timesheet::class, 'id');
        $idProperty->setValue($timesheet, 1);

        $rowWithData = new QuickEntryModel($user);
        $rowWithData->addTimesheet($timesheet);
        $sut->setRows([$rowWithData]);
        self::assertTrue($sut->hasRowsWithExistingTimesheets());
    }
}

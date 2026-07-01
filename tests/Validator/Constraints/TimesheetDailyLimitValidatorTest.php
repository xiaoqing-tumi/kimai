<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Validator\Constraints;

use App\Configuration\SystemConfiguration;
use App\Entity\Timesheet;
use App\Entity\User;
use App\Repository\TimesheetRepository;
use App\Validator\Constraints\TimesheetDailyLimit;
use App\Validator\Constraints\TimesheetDailyLimitValidator;
use Symfony\Component\Validator\Test\ConstraintValidatorTestCase;

/**
 * @extends ConstraintValidatorTestCase<TimesheetDailyLimitValidator>
 */
final class TimesheetDailyLimitValidatorTest extends ConstraintValidatorTestCase
{
    private SystemConfiguration $configuration;
    private TimesheetRepository $repository;

    protected function createValidator(): TimesheetDailyLimitValidator
    {
        $this->configuration = $this->createMock(SystemConfiguration::class);
        $this->repository = $this->createMock(TimesheetRepository::class);

        return new TimesheetDailyLimitValidator($this->configuration, $this->repository);
    }

    public function testWithinDailyLimit(): void
    {
        $user = new User();
        $timesheet = new Timesheet();
        $timesheet->setUser($user);
        $timesheet->setBegin(new \DateTime('2026-06-30 09:00:00'));
        $timesheet->setEnd(new \DateTime('2026-06-30 17:00:00'));
        $timesheet->setDuration(14400);

        $this->configuration->method('getTimesheetMaxHoursPerDay')->willReturn(8);
        $this->repository->method('getDurationForDay')->willReturn(14400);

        $this->validator->validate($timesheet, new TimesheetDailyLimit());
        $this->assertNoViolation();
    }

    public function testFullShiftDayWithinDailyLimit(): void
    {
        $user = new User();
        $timesheet = new Timesheet();
        $timesheet->setUser($user);
        $timesheet->setBegin(new \DateTime('2026-06-30 09:00:00'));
        $timesheet->setEnd(new \DateTime('2026-06-30 18:00:00'));
        $timesheet->setBreak(3600);
        $timesheet->setDuration(32400);

        $this->configuration->method('getTimesheetMaxHoursPerDay')->willReturn(8);
        $this->repository->method('getDurationForDay')->willReturn(0);

        $this->validator->validate($timesheet, new TimesheetDailyLimit());
        $this->assertNoViolation();
    }

    public function testExceedsDailyLimit(): void
    {
        $user = new User();
        $timesheet = new Timesheet();
        $timesheet->setUser($user);
        $timesheet->setBegin(new \DateTime('2026-06-30 09:00:00'));
        $timesheet->setEnd(new \DateTime('2026-06-30 18:00:00'));
        $timesheet->setDuration(28800);

        $this->configuration->method('getTimesheetMaxHoursPerDay')->willReturn(8);
        $this->repository->method('getDurationForDay')->willReturn(21600);

        $this->validator->validate($timesheet, new TimesheetDailyLimit());
        $this->buildViolation('The daily limit of {{ value }} hours is exceeded. Current total would be {{ total }}.')
            ->setParameter('{{ value }}', '8:00')
            ->setParameter('{{ total }}', '14:00')
            ->setCode(TimesheetDailyLimit::DAILY_LIMIT_EXCEEDED)
            ->atPath('property.path.duration')
            ->assertRaised();
    }
}

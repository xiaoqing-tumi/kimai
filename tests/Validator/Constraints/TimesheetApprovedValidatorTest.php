<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Validator\Constraints;

use App\Entity\Timesheet;
use App\Entity\User;
use App\Validator\Constraints\TimesheetApproved;
use App\Validator\Constraints\TimesheetApprovedValidator;
use App\WorkingTime\WorkingTimeService;
use PHPUnit\Framework\Attributes\CoversClass;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Test\ConstraintValidatorTestCase;

/**
 * @extends ConstraintValidatorTestCase<TimesheetApprovedValidator>
 */
#[CoversClass(TimesheetApproved::class)]
#[CoversClass(TimesheetApprovedValidator::class)]
final class TimesheetApprovedValidatorTest extends ConstraintValidatorTestCase
{
    protected function createValidator(): TimesheetApprovedValidator
    {
        return $this->createMyValidator(false);
    }

    protected function createMyValidator(bool $approved): TimesheetApprovedValidator
    {
        $workingTimeService = $this->createMock(WorkingTimeService::class);
        $workingTimeService->method('isApproved')->willReturn($approved);

        return new TimesheetApprovedValidator($workingTimeService);
    }

    public function testConstraintIsInvalid(): void
    {
        $this->expectException(UnexpectedTypeException::class);

        $this->validator->validate(new Timesheet(), new NotBlank());
    }

    public function testInvalidValueThrowsException(): void
    {
        $this->expectException(UnexpectedTypeException::class);

        $this->validator->validate(new NotBlank(), new TimesheetApproved());
    }

    public function testValidatorWithEmptyTimesheet(): void
    {
        $this->validator->validate(new Timesheet(), new TimesheetApproved());
        self::assertEmpty($this->context->getViolations());
    }

    public function testValidatorAllowsUnapprovedPeriod(): void
    {
        $user = new User();
        $timesheet = new Timesheet();
        $timesheet->setUser($user);
        $timesheet->setBegin(new \DateTime('2026-06-24 08:00:00'));

        $this->validator->validate($timesheet, new TimesheetApproved());
        self::assertEmpty($this->context->getViolations());
    }

    public function testValidatorRejectsApprovedPeriod(): void
    {
        $this->validator = $this->createMyValidator(true);
        $this->validator->initialize($this->context);

        $user = new User();
        $timesheet = new Timesheet();
        $timesheet->setUser($user);
        $timesheet->setBegin(new \DateTime('2026-06-24 08:00:00'));

        $this->validator->validate($timesheet, new TimesheetApproved());

        $this->buildViolation('The chosen date is already locked.')
            ->atPath('property.path.begin_date')
            ->setCode(TimesheetApproved::PERIOD_LOCKED)
            ->assertRaised();
    }
}

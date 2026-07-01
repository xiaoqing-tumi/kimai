<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Validator\Constraints;

use App\Entity\Timesheet as TimesheetEntity;
use App\WorkingTime\WorkingTimeService;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

final class TimesheetApprovedValidator extends ConstraintValidator
{
    public function __construct(
        private readonly WorkingTimeService $workingTimeService
    )
    {
    }

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!($constraint instanceof TimesheetApproved)) {
            throw new UnexpectedTypeException($constraint, TimesheetApproved::class);
        }

        if (!\is_object($value) || !($value instanceof TimesheetEntity)) {
            throw new UnexpectedTypeException($value, TimesheetEntity::class);
        }

        $owner = $value->getUser();
        $begin = $value->getBegin();

        if ($owner === null || $begin === null) {
            return;
        }

        if (!$this->workingTimeService->isApproved($owner, $begin, false)) {
            return;
        }

        $this->context->buildViolation('The chosen date is already locked.')
            ->atPath('begin_date')
            ->setTranslationDomain('validators')
            ->setCode(TimesheetApproved::PERIOD_LOCKED)
            ->addViolation();
    }
}

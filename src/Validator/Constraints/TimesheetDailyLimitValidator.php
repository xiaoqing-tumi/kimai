<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Validator\Constraints;

use App\Configuration\SystemConfiguration;
use App\Entity\Timesheet as TimesheetEntity;
use App\Repository\TimesheetRepository;
use App\Utils\Duration;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

final class TimesheetDailyLimitValidator extends ConstraintValidator
{
    public function __construct(
        private readonly SystemConfiguration $systemConfiguration,
        private readonly TimesheetRepository $timesheetRepository,
    ) {
    }

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!($constraint instanceof TimesheetDailyLimit)) {
            throw new UnexpectedTypeException($constraint, TimesheetDailyLimit::class);
        }

        if (!\is_object($value) || !($value instanceof TimesheetEntity)) {
            throw new UnexpectedTypeException($value, TimesheetEntity::class);
        }

        if ($value->isRunning()) {
            return;
        }

        $duration = $this->getNetWorkingDuration($value);
        if ($duration === null || $duration <= 0) {
            return;
        }

        $begin = $value->getBegin();
        $user = $value->getUser();
        if ($begin === null || $user === null) {
            return;
        }

        $maxHours = $this->getMaxHoursForDate($begin);
        if ($maxHours <= 0) {
            return;
        }

        $dayStart = \DateTime::createFromInterface($begin);
        $dayStart->setTime(0, 0, 0);
        $dayEnd = clone $dayStart;
        $dayEnd->setTime(23, 59, 59);

        $existing = $this->timesheetRepository->getDurationForDay($user, $dayStart, $dayEnd, $value->getId());
        $totalSeconds = $existing + $duration;
        $maxSeconds = $maxHours * 3600;

        if ($totalSeconds <= $maxSeconds) {
            return;
        }

        $format = new Duration();
        $this->context->buildViolation($constraint->message)
            ->setParameter('{{ value }}', $format->format($maxSeconds))
            ->setParameter('{{ total }}', $format->format($totalSeconds))
            ->setTranslationDomain('validators')
            ->atPath('duration')
            ->setCode(TimesheetDailyLimit::DAILY_LIMIT_EXCEEDED)
            ->addViolation();
    }

    private function getMaxHoursForDate(\DateTimeInterface $date): int
    {
        $dayOfWeek = (int) $date->format('N');
        if ($dayOfWeek >= 6) {
            return $this->systemConfiguration->getTimesheetMaxHoursWeekend();
        }

        return $this->systemConfiguration->getTimesheetMaxHoursPerDay();
    }

    /**
     * Daily limits apply to net working time (duration minus break), not gross span begin-to-end.
     */
    private function getNetWorkingDuration(TimesheetEntity $timesheet): ?int
    {
        if ($timesheet->getBegin() !== null && $timesheet->getEnd() !== null) {
            return $timesheet->getCalculatedDuration();
        }

        $duration = $timesheet->getDuration(false);
        if ($duration === null) {
            return null;
        }

        return max(0, $duration - $timesheet->getBreak());
    }
}

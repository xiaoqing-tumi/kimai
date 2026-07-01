<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Timesheet;

use App\Configuration\SystemConfiguration;
use App\Entity\Timesheet;
use App\Entity\User;

final class LockdownService
{
    private const USER_LOCKDOWN_START = 'lockdown_period_start';
    private const USER_LOCKDOWN_END = 'lockdown_period_end';
    private const USER_LOCKDOWN_TIMEZONE = 'lockdown_period_timezone';
    private const USER_LOCKDOWN_GRACE = 'lockdown_grace_period';

    private ?bool $isActive = null;

    public function __construct(private readonly SystemConfiguration $configuration)
    {
    }

    public function isUserLockdownActive(User $user): bool
    {
        return $this->getUserLockdownPeriodEnd($user) !== null
            && $this->getUserLockdownPeriodStart($user) !== null;
    }

    public function isLockdownActive(): bool
    {
        if ($this->isActive === null) {
            $this->isActive = $this->getLockdownPeriodStart() !== null && $this->getLockdownPeriodEnd() !== null;
        }

        return $this->isActive;
    }

    public function getLockdownTimezone(): ?string
    {
        $timezone = $this->configuration->find('timesheet.rules.lockdown_period_timezone');

        if ($timezone === null || $timezone === '') {
            return null;
        }

        return (string) $timezone;
    }

    private function getTimezone(User $user): \DateTimeZone
    {
        $timezone = $this->getLockdownTimezone();

        if ($timezone === null) {
            $timezone = $user->getTimezone();
        }

        return new \DateTimeZone($timezone);
    }

    public function getLockdownStart(User $user): ?\DateTimeInterface
    {
        $start = $this->getLockdownPeriodStart();
        if ($start === null) {
            return null;
        }

        $start = new \DateTimeImmutable($start, $this->getTimezone($user));

        return $start->setTimezone(new \DateTimeZone($user->getTimezone()));
    }

    private function getLockdownPeriodStart(): ?string
    {
        $start = $this->configuration->find('timesheet.rules.lockdown_period_start');

        if (!\is_string($start) || trim($start) === '') {
            return null;
        }

        $start = explode(',', $start);
        if (\count($start) === 1) {
            return $start[0];
        }

        $min = null;
        $date = null;
        foreach ($start as $dateString) {
            $tmp = new \DateTimeImmutable($dateString);
            if ($min === null) {
                $min = $dateString;
                $date = $tmp;
                continue;
            }
            if ($tmp > $date) {
                $min = $dateString;
                $date = $tmp;
            }
        }

        return $min;
    }

    public function getLockdownEnd(User $user): ?\DateTimeInterface
    {
        $end = $this->getLockdownPeriodEnd();
        if ($end === null) {
            return null;
        }

        $end = new \DateTimeImmutable($end, $this->getTimezone($user));

        return $end->setTimezone(new \DateTimeZone($user->getTimezone()));
    }

    private function getLockdownPeriodEnd(): ?string
    {
        $end = $this->configuration->find('timesheet.rules.lockdown_period_end');

        if (!\is_string($end) || trim($end) === '') {
            return null;
        }

        $end = explode(',', $end);
        if (\count($end) === 1) {
            return $end[0];
        }

        $min = null;
        $date = null;
        foreach ($end as $dateString) {
            $tmp = new \DateTimeImmutable($dateString);
            if ($min === null) {
                $min = $dateString;
                $date = $tmp;
                continue;
            }
            if ($tmp > $date) {
                $min = $dateString;
                $date = $tmp;
            }
        }

        return $min;
    }

    public function getLockdownGrace(User $user): ?\DateTimeInterface
    {
        $gracePeriod = $this->getLockdownGracePeriod();
        if ($gracePeriod === null) {
            return null;
        }

        $end = $this->getLockdownEnd($user);
        if ($end === null) {
            return null;
        }

        $grace = \DateTimeImmutable::createFromInterface($end);

        return $grace->modify($gracePeriod);
    }

    private function getLockdownGracePeriod(): ?string
    {
        $grace = $this->configuration->find('timesheet.rules.lockdown_grace_period');

        if ($grace === null || $grace === '') {
            return null;
        }

        return (string) $grace;
    }

    /**
     * Does not check if the current user is allowed to edit timesheets in lockdown situations.
     * This needs to be performed earlier by yourself (see TimesheetVoter or LockdownValidator).
     *
     * @param Timesheet $timesheet
     * @param \DateTimeInterface $now
     * @param bool $allowEditInGracePeriod
     * @return bool
     */
    public function isEditable(Timesheet $timesheet, \DateTimeInterface $now, bool $allowEditInGracePeriod = false): bool
    {
        $timesheetStart = $timesheet->getBegin();

        if (null === $timesheetStart) {
            return true;
        }

        $user = $timesheet->getUser();
        if ($user !== null && $this->isUserLockdownActive($user)) {
            if (!$this->isEditableInLockdownPeriod(
                $timesheetStart,
                $now,
                $allowEditInGracePeriod,
                $this->getUserLockdownPeriodStart($user),
                $this->getUserLockdownPeriodEnd($user),
                $this->getUserLockdownGracePeriod($user),
                $this->getUserLockdownTimezone($user, $timesheetStart)
            )) {
                return false;
            }
        }

        if (!$this->isLockdownActive()) {
            return true;
        }

        $lockedStart = $this->getLockdownPeriodStart();
        $lockedEnd = $this->getLockdownPeriodEnd();

        if ($lockedStart === null || $lockedEnd === null) {
            return true;
        }

        return $this->isEditableInLockdownPeriod(
            $timesheetStart,
            $now,
            $allowEditInGracePeriod,
            $lockedStart,
            $lockedEnd,
            $this->getLockdownGracePeriod(),
            $this->resolveLockdownTimezone($this->getLockdownTimezone(), $timesheetStart)
        );
    }

    private function getUserLockdownPeriodStart(User $user): ?string
    {
        $start = $user->getPreferenceValue(self::USER_LOCKDOWN_START, false);
        if ($start === false || !\is_string($start) || trim($start) === '') {
            return null;
        }

        return $start;
    }

    private function getUserLockdownPeriodEnd(User $user): ?string
    {
        $end = $user->getPreferenceValue(self::USER_LOCKDOWN_END, false);
        if ($end === false || !\is_string($end) || trim($end) === '') {
            return null;
        }

        return $end;
    }

    private function getUserLockdownGracePeriod(User $user): ?string
    {
        $grace = $user->getPreferenceValue(self::USER_LOCKDOWN_GRACE, false);
        if ($grace === false || !\is_string($grace) || trim($grace) === '') {
            return null;
        }

        return $grace;
    }

    private function getUserLockdownTimezone(User $user, \DateTimeInterface $timesheetStart): \DateTimeZone
    {
        $timezone = $user->getPreferenceValue(self::USER_LOCKDOWN_TIMEZONE, false);
        if (\is_string($timezone) && $timezone !== '') {
            return new \DateTimeZone($timezone);
        }

        return $this->resolveLockdownTimezone(null, $timesheetStart);
    }

    private function resolveLockdownTimezone(?string $timezone, \DateTimeInterface $timesheetStart): \DateTimeZone
    {
        if ($timezone === null || $timezone === '') {
            return $timesheetStart->getTimezone();
        }

        return new \DateTimeZone($timezone);
    }

    private function isEditableInLockdownPeriod(
        \DateTimeInterface $timesheetStart,
        \DateTimeInterface $now,
        bool $allowEditInGracePeriod,
        ?string $lockedStart,
        ?string $lockedEnd,
        ?string $gracePeriod,
        \DateTimeZone $timezone
    ): bool {
        if ($lockedStart === null || $lockedEnd === null) {
            return true;
        }

        try {
            $lockdownStart = new \DateTimeImmutable($lockedStart, $timezone);
            $lockdownEnd = new \DateTimeImmutable($lockedEnd, $timezone);
            $lockdownGrace = $this->resolveLockdownGrace($lockdownEnd, $gracePeriod, $timezone);
        } catch (\Exception $ex) {
            return true;
        }

        if ($lockdownEnd < $lockdownStart) {
            return true;
        }

        if ($timesheetStart > $lockdownEnd) {
            return true;
        }

        if ($timesheetStart >= $lockdownStart) {
            if ($now <= $lockdownGrace) {
                return true;
            }

            if ($allowEditInGracePeriod) {
                return true;
            }
        }

        return false;
    }

    private function resolveLockdownGrace(
        \DateTimeImmutable $lockdownEnd,
        ?string $gracePeriod,
        \DateTimeZone $timezone
    ): \DateTimeImmutable {
        if ($gracePeriod === null || $gracePeriod === '') {
            return $lockdownEnd;
        }

        if ($gracePeriod[0] === '+' || $gracePeriod[0] === '-') {
            return $lockdownEnd->modify($gracePeriod);
        }

        return new \DateTimeImmutable($gracePeriod, $timezone);
    }
}

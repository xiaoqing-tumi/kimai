<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Validator\Constraints;

final class TimesheetApproved extends TimesheetConstraint
{
    public const PERIOD_LOCKED = 'kimai-timesheet-approved-01';

    protected const ERROR_NAMES = [
        self::PERIOD_LOCKED => 'The chosen date is already locked.',
    ];

    public string $message = 'The chosen date is already locked.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}

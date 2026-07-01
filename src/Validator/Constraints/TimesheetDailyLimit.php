<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Validator\Constraints;

final class TimesheetDailyLimit extends TimesheetConstraint
{
    public const DAILY_LIMIT_EXCEEDED = 'kimai-timesheet-daily-limit-01';

    protected const ERROR_NAMES = [
        self::DAILY_LIMIT_EXCEEDED => 'TIMESHEET_DAILY_LIMIT_EXCEEDED',
    ];

    public string $message = 'The daily limit of {{ value }} hours is exceeded. Current total would be {{ total }}.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}

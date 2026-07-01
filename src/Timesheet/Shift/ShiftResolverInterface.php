<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Timesheet\Shift;

use App\Entity\User;

interface ShiftResolverInterface
{
    public function resolve(User $user, \DateTimeInterface $date): ShiftTemplate;
}

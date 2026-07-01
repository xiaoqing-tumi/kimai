<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\API\Model;

use JMS\Serializer\Annotation as Serializer;

#[Serializer\ExclusionPolicy('all')]
final class AttendanceImportResult
{
    #[Serializer\Expose]
    #[Serializer\Groups(['Default'])]
    #[Serializer\Type(name: 'integer')]
    private int $imported;

    public function __construct(int $imported)
    {
        $this->imported = $imported;
    }

    public function getImported(): int
    {
        return $this->imported;
    }
}

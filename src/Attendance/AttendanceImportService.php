<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Attendance;

use App\Entity\AttendanceRecord;
use App\Entity\User;
use App\Repository\AttendanceRecordRepository;

/**
 * Stores attendance records imported from external systems.
 */
final class AttendanceImportService
{
    public function __construct(
        private readonly AttendanceRecordRepository $repository,
    ) {
    }

    /**
     * @param array<int, array{date: string, clock_in: ?string, clock_out: ?string, external_id?: ?string}> $records
     */
    public function importForUser(User $user, array $records, string $source = 'external'): int
    {
        $imported = 0;

        foreach ($records as $row) {
            $date = new \DateTimeImmutable($row['date']);
            $record = $this->repository->findForUserAndDate($user, $date);

            if ($record === null) {
                $record = new AttendanceRecord();
                $record->setUser($user);
                $record->setDate($date);
            }

            if (isset($row['clock_in']) && $row['clock_in'] !== null && $row['clock_in'] !== '') {
                $record->setClockIn(new \DateTime($row['clock_in']));
            }

            if (isset($row['clock_out']) && $row['clock_out'] !== null && $row['clock_out'] !== '') {
                $record->setClockOut(new \DateTime($row['clock_out']));
            }

            $record->setExternalSource($source);
            if (isset($row['external_id'])) {
                $record->setExternalId($row['external_id']);
            }

            $record->setSyncedAt(new \DateTime());
            $this->repository->save($record);
            $imported++;
        }

        return $imported;
    }
}

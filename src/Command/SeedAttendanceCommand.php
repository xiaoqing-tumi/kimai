<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Command;

use App\Entity\AttendanceRecord;
use App\Entity\User;
use App\Repository\AttendanceRecordRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Seeds demo attendance records for enabled users (testing only).
 */
#[AsCommand(
    name: 'kimai:seed:attendance',
    description: 'Generate demo attendance from the start of a year through today (no future dates)'
)]
final class SeedAttendanceCommand extends Command
{
    private const DEMO_SOURCE = 'demo';

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly AttendanceRecordRepository $attendanceRecordRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('year', null, InputOption::VALUE_REQUIRED, 'Start year (records run from Jan 1 through today only)', (string) (int) date('Y'))
            ->addOption('force', null, InputOption::VALUE_NONE, 'Replace existing demo attendance records')
            ->addOption('weekdays-only', null, InputOption::VALUE_NONE, 'Skip Saturday and Sunday');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $year = (int) $input->getOption('year');
        $force = (bool) $input->getOption('force');
        $weekdaysOnly = (bool) $input->getOption('weekdays-only');

        if ($year < 2000 || $year > 2100) {
            $io->error('Invalid year.');

            return self::FAILURE;
        }

        $users = $this->userRepository->findBy(['enabled' => true], ['username' => 'ASC']);
        if (\count($users) === 0) {
            $io->warning('No enabled users found.');

            return self::SUCCESS;
        }

        $today = new \DateTimeImmutable('today');
        $yearStart = new \DateTimeImmutable(\sprintf('%d-01-01', $year));
        $yearEnd = new \DateTimeImmutable(\sprintf('%d-12-31', $year));
        $endDate = $yearEnd < $today ? $yearEnd : $today;

        if ($endDate < $yearStart) {
            $io->warning('Nothing to generate: year is in the future.');

            return self::SUCCESS;
        }

        $created = 0;
        $skipped = 0;
        $replaced = 0;
        $syncedAt = new \DateTime();

        foreach ($users as $user) {
            $day = $yearStart;
            while ($day <= $endDate) {
                if ($weekdaysOnly && $this->isWeekend($day)) {
                    $day = $day->modify('+1 day');
                    continue;
                }

                $existing = $this->attendanceRecordRepository->findForUserAndDate($user, $day);
                if ($existing !== null) {
                    if ($force && $existing->getExternalSource() === self::DEMO_SOURCE) {
                        $this->entityManager->remove($existing);
                        $replaced++;
                    } else {
                        $skipped++;
                        $day = $day->modify('+1 day');
                        continue;
                    }
                }

                $record = $this->createDemoRecord($user, $day, $syncedAt);
                $this->entityManager->persist($record);
                $created++;

                $day = $day->modify('+1 day');
            }
        }

        $this->entityManager->flush();

        $io->success(\sprintf(
            'Attendance demo data: %d record(s) created, %d skipped, %d replaced (%d user(s), %s to %s).',
            $created,
            $skipped,
            $replaced,
            \count($users),
            $yearStart->format('Y-m-d'),
            $endDate->format('Y-m-d')
        ));

        return self::SUCCESS;
    }

    private function createDemoRecord(User $user, \DateTimeImmutable $day, \DateTime $syncedAt): AttendanceRecord
    {
        $shiftA = random_int(0, 1) === 1;

        if ($shiftA) {
            $clockIn = $day->setTime(8, random_int(30, 59), random_int(0, 59));
            $clockOut = $day->setTime(18, random_int(0, 10), random_int(0, 59));
        } else {
            $clockIn = $day->setTime(9, random_int(1, 29), random_int(0, 59));
            $clockOut = $day->setTime(18, random_int(25, 35), random_int(0, 59));
        }

        $record = new AttendanceRecord();
        $record->setUser($user);
        $record->setDate($day);
        $record->setClockIn(\DateTime::createFromImmutable($clockIn));
        $record->setClockOut(\DateTime::createFromImmutable($clockOut));
        $record->setExternalSource(self::DEMO_SOURCE);
        $record->setExternalId(\sprintf('demo-%d-%s', $user->getId(), $day->format('Y-m-d')));
        $record->setSyncedAt($syncedAt);

        return $record;
    }

    private function isWeekend(\DateTimeImmutable $day): bool
    {
        $weekday = (int) $day->format('N');

        return $weekday >= 6;
    }
}

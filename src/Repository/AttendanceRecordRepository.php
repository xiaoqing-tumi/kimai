<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Repository;

use App\Entity\AttendanceRecord;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AttendanceRecord>
 */
class AttendanceRecordRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AttendanceRecord::class);
    }

    public function findForUserAndDate(User $user, \DateTimeInterface $date): ?AttendanceRecord
    {
        $immutable = \DateTimeImmutable::createFromInterface($date);
        $immutable = $immutable->setTime(0, 0, 0);

        return $this->findOneBy([
            'user' => $user,
            'date' => $immutable,
        ]);
    }

    /**
     * @return AttendanceRecord[]
     */
    public function findForUserInRange(User $user, \DateTimeInterface $begin, \DateTimeInterface $end): array
    {
        $qb = $this->createQueryBuilder('a');
        $qb
            ->andWhere($qb->expr()->eq('a.user', ':user'))
            ->andWhere($qb->expr()->between('a.date', ':begin', ':end'))
            ->setParameter('user', $user)
            ->setParameter('begin', \DateTimeImmutable::createFromInterface($begin)->setTime(0, 0, 0))
            ->setParameter('end', \DateTimeImmutable::createFromInterface($end)->setTime(0, 0, 0))
            ->orderBy('a.date', 'ASC');

        return $qb->getQuery()->getResult();
    }

    public function save(AttendanceRecord $record): void
    {
        $this->getEntityManager()->persist($record);
        $this->getEntityManager()->flush();
    }
}

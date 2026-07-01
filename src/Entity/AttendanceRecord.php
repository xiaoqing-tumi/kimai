<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Entity;

use App\Repository\AttendanceRecordRepository;
use App\Timesheet\Shift\ShiftFromClockIn;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

#[ORM\Table(name: 'kimai2_attendance_records')]
#[ORM\UniqueConstraint(columns: ['user_id', 'attendance_date'])]
#[ORM\Entity(repositoryClass: AttendanceRecordRepository::class)]
#[ORM\ChangeTrackingPolicy('DEFERRED_EXPLICIT')]
#[Serializer\ExclusionPolicy('all')]
#[Serializer\VirtualProperty('UserAsId', exp: 'object.getUser() === null ? null : object.getUser().getId()', options: [new Serializer\SerializedName('user'), new Serializer\Type(name: 'integer'), new Serializer\Groups(['Not_Expanded'])])]
#[Serializer\VirtualProperty('ShiftId', exp: 'object.getResolvedShiftId()', options: [new Serializer\SerializedName('shift'), new Serializer\Type(name: 'string'), new Serializer\Groups(['Default'])])]
class AttendanceRecord
{
    /**
     * Attendance record ID
     */
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id', type: Types::INTEGER)]
    #[Serializer\Expose]
    #[Serializer\Groups(['Default'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    /**
     * Attendance date
     */
    #[ORM\Column(name: 'attendance_date', type: Types::DATE_IMMUTABLE)]
    #[Serializer\Expose]
    #[Serializer\Groups(['Default'])]
    #[Serializer\Type(name: "DateTimeImmutable<'Y-m-d'>")]
    private ?\DateTimeImmutable $date = null;

    /**
     * Clock-in time
     */
    #[ORM\Column(name: 'clock_in', type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Serializer\Expose]
    #[Serializer\Groups(['Default'])]
    #[Serializer\Type(name: 'DateTime')]
    private ?\DateTime $clockIn = null;

    /**
     * Clock-out time
     */
    #[ORM\Column(name: 'clock_out', type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Serializer\Expose]
    #[Serializer\Groups(['Default'])]
    #[Serializer\Type(name: 'DateTime')]
    private ?\DateTime $clockOut = null;

    /**
     * External source identifier
     */
    #[ORM\Column(name: 'external_source', type: Types::STRING, length: 100, nullable: true)]
    #[Serializer\Expose]
    #[Serializer\Groups(['Default'])]
    private ?string $externalSource = null;

    /**
     * External record identifier
     */
    #[ORM\Column(name: 'external_id', type: Types::STRING, length: 255, nullable: true)]
    #[Serializer\Expose]
    #[Serializer\Groups(['Default'])]
    private ?string $externalId = null;

    /**
     * Last sync time
     */
    #[ORM\Column(name: 'synced_at', type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Serializer\Expose]
    #[Serializer\Groups(['Default'])]
    #[Serializer\Type(name: 'DateTime')]
    private ?\DateTime $syncedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): void
    {
        $this->user = $user;
    }

    public function getDate(): ?\DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): void
    {
        $this->date = $date;
    }

    public function getClockIn(): ?\DateTime
    {
        return $this->clockIn;
    }

    public function setClockIn(?\DateTime $clockIn): void
    {
        $this->clockIn = $clockIn;
    }

    public function getClockOut(): ?\DateTime
    {
        return $this->clockOut;
    }

    public function setClockOut(?\DateTime $clockOut): void
    {
        $this->clockOut = $clockOut;
    }

    public function getExternalSource(): ?string
    {
        return $this->externalSource;
    }

    public function setExternalSource(?string $externalSource): void
    {
        $this->externalSource = $externalSource;
    }

    public function getExternalId(): ?string
    {
        return $this->externalId;
    }

    public function setExternalId(?string $externalId): void
    {
        $this->externalId = $externalId;
    }

    public function getSyncedAt(): ?\DateTime
    {
        return $this->syncedAt;
    }

    public function setSyncedAt(?\DateTime $syncedAt): void
    {
        $this->syncedAt = $syncedAt;
    }

    public function getResolvedShiftId(): ?string
    {
        if ($this->clockIn === null || $this->user === null) {
            return null;
        }

        return ShiftFromClockIn::resolveShiftId($this->clockIn, $this->user->getTimezone());
    }
}

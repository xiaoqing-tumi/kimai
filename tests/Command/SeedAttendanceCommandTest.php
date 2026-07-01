<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Command;

use App\Attendance\DemoAttendanceGenerator;
use App\Command\SeedAttendanceCommand;
use App\Repository\AttendanceRecordRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\Attributes\CoversClass;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

#[CoversClass(SeedAttendanceCommand::class)]
class SeedAttendanceCommandTest extends KernelTestCase
{
    public function testCommandIsRegistered(): void
    {
        $kernel = self::bootKernel();
        $application = new Application($kernel);
        $application->add(new SeedAttendanceCommand(
            $this->createMock(UserRepository::class),
            $this->createMock(AttendanceRecordRepository::class),
            $this->createMock(EntityManagerInterface::class),
            new DemoAttendanceGenerator(),
        ));

        self::assertTrue($application->has('kimai:seed:attendance'));
        $command = $application->find('kimai:seed:attendance');
        self::assertInstanceOf(SeedAttendanceCommand::class, $command);
    }
}

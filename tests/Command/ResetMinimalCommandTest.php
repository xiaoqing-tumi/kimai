<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\Command;

use App\Command\ResetMinimalCommand;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Group;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[CoversClass(ResetMinimalCommand::class)]
#[Group('integration')]
class ResetMinimalCommandTest extends KernelTestCase
{
    public function testCommandName(): void
    {
        $kernel = self::bootKernel();
        $application = new Application($kernel);
        $application->add(new ResetMinimalCommand(
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(UserPasswordHasherInterface::class),
            'dev'
        ));

        self::assertTrue($application->has('kimai:reset:minimal'));
        $command = $application->find('kimai:reset:minimal');
        self::assertInstanceOf(ResetMinimalCommand::class, $command);
    }

    public function testCommandNameIsNotEnabledInProd(): void
    {
        $sut = new ResetMinimalCommand(
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(UserPasswordHasherInterface::class),
            'prod'
        );
        self::assertFalse($sut->isEnabled());
    }
}

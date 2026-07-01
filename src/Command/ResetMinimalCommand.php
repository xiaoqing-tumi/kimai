<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Command;

use App\DataFixtures\UserFixtures;
use App\Entity\AccessToken;
use App\Entity\Activity;
use App\Entity\Customer;
use App\Entity\Invoice;
use App\Entity\InvoiceTemplate;
use App\Entity\Project;
use App\Entity\Tag;
use App\Entity\Team;
use App\Entity\Timesheet;
use App\Entity\User;
use App\Entity\UserPreference;
use App\Timesheet\RateCalculator\ClassicRateCalculator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Resets the development database with a minimal dataset for local browsing.
 *
 * @codeCoverageIgnore
 */
#[AsCommand(name: 'kimai:reset:minimal', description: 'Resets the "development" environment with minimal demo data')]
final class ResetMinimalCommand extends AbstractResetCommand
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        string $kernelEnvironment,
    ) {
        parent::__construct($kernelEnvironment);
    }

    protected function loadData(InputInterface $input, OutputInterface $output): void
    {
        $customer = new Customer('Demo Customer GmbH');
        $customer->setNumber('C-1001');
        $customer->setComment('Minimal demo customer');
        $customer->setCompany('Demo Customer GmbH');
        $customer->setCountry('DE');
        $customer->setCurrency('EUR');
        $customer->setEmail('billing@demo.example.com');
        $customer->setTimezone('Europe/Berlin');
        $customer->setVisible(true);
        $customer->setBudget(10000);
        $customer->setTimeBudget(360000);
        $this->entityManager->persist($customer);

        $project = new Project();
        $project->setName('Website Redesign');
        $project->setComment('Minimal demo project');
        $project->setOrderNumber('P-1001');
        $project->setCustomer($customer);
        $project->setVisible(true);
        $project->setBudget(5000);
        $project->setTimeBudget(180000);
        $this->entityManager->persist($project);

        $activityDev = new Activity();
        $activityDev->setName('Development');
        $activityDev->setComment('Project development work');
        $activityDev->setProject($project);
        $activityDev->setVisible(true);
        $this->entityManager->persist($activityDev);

        $activityMeeting = new Activity();
        $activityMeeting->setName('Meeting');
        $activityMeeting->setComment('Global meeting activity');
        $activityMeeting->setVisible(true);
        $this->entityManager->persist($activityMeeting);

        $tags = [];
        foreach (['dev', 'meeting', 'billable'] as $tagName) {
            $tag = new Tag();
            $tag->setName($tagName);
            $tag->setVisible(true);
            $this->entityManager->persist($tag);
            $tags[] = $tag;
        }

        $users = $this->createUsers();
        foreach ($users as [$user, $token]) {
            $this->entityManager->persist($user);
            $this->entityManager->persist($token);
        }

        $this->entityManager->flush();

        /** @var User $johnUser */
        $johnUser = $users[1][0];
        /** @var User $teamlead */
        $teamlead = $users[2][0];
        /** @var User $admin */
        $admin = $users[3][0];

        $team = new Team('Development');
        $team->addTeamlead($teamlead);
        $team->addUser($johnUser);
        $team->addProject($project);
        $this->entityManager->persist($team);

        $calculator = new ClassicRateCalculator();
        $timesheetDefinitions = [
            [$johnUser, $activityDev, $project, 'Implemented login page', -5, 120],
            [$johnUser, $activityDev, $project, 'Fixed styling issues', -3, 90],
            [$teamlead, $activityMeeting, $project, 'Sprint planning', -2, 60],
            [$johnUser, $activityDev, $project, 'API integration', -1, 180],
            [$admin, $activityDev, $project, 'Code review', -1, 45],
        ];

        foreach ($timesheetDefinitions as [$user, $activity, $timesheetProject, $description, $daysAgo, $minutes]) {
            $timesheet = $this->createTimesheet($calculator, $user, $activity, $timesheetProject, $description, $daysAgo, $minutes);
            $timesheet->addTag($tags[0]);
            $this->entityManager->persist($timesheet);
        }

        $template = new InvoiceTemplate();
        $template->setName('Default (PDF)');
        $template->setTitle('Invoice');
        $template->setRenderer('default');
        $template->setCalculator('default');
        $template->setNumberGenerator('default');
        $template->setCompany('Kimai Demo GmbH');
        $template->setCustomer($customer);
        $template->setVat(19);
        $template->setDueDays(14);
        $template->setLanguage('en');
        $template->setAddress("Demo Street 1\n10115 Berlin, Germany");
        $template->setContact("Phone: +49 30 123456\nEmail: billing@demo.example.com");
        $template->setPaymentDetails("Demo Bank\nBIC: DEMODEMO\nIBAN: DE89370400440532013000");
        $template->setPaymentTerms('Please pay within 14 days. Thank you for your business.');
        $this->entityManager->persist($template);

        $invoice = new Invoice();
        $invoice->setStatus(Invoice::STATUS_PENDING);
        $invoice->setCustomer($customer);
        $invoice->setUser($admin);
        $invoice->setInvoiceNumber('INV-2026-001');
        $invoice->setFilename('INV-2026-001.pdf');
        $invoice->setCreatedAt(new \DateTime('-7 days'));
        $invoice->setTotal(595.00);
        $invoice->setTax(95.00);
        $invoice->setVat(0.19);
        $invoice->setCurrency('EUR');
        $invoice->setDueDays(14);
        $invoice->setComment('Minimal demo invoice');
        $this->entityManager->persist($invoice);

        $this->entityManager->flush();
    }

    /**
     * @return array<int, array{0: User, 1: AccessToken}>
     */
    private function createUsers(): array
    {
        $definitions = [
            ['clara_customer', 'clara_customer@example.com', 'Clara Customer', 'Customer contact', ['ROLE_CUSTOMER'], '_customer'],
            [UserFixtures::USERNAME_USER, 'john_user@example.com', 'John Doe', 'Developer', [User::ROLE_USER], '_user'],
            [UserFixtures::USERNAME_TEAMLEAD, 'tony_teamlead@example.com', 'Tony Maier', 'Team Lead', [User::ROLE_TEAMLEAD], '_teamlead'],
            [UserFixtures::USERNAME_ADMIN, 'anna_admin@example.com', 'Anna Smith', 'Administrator', [User::ROLE_ADMIN], '_admin'],
            [UserFixtures::USERNAME_SUPER_ADMIN, 'susan_super@example.com', 'Susan Super', 'Super Administrator', [User::ROLE_SUPER_ADMIN], '_super'],
        ];

        $users = [];
        foreach ($definitions as [$username, $email, $alias, $title, $roles, $tokenSuffix]) {
            $user = new User();
            $user->setUserIdentifier($username);
            $user->setEmail($email);
            $user->setAlias($alias);
            $user->setTitle($title);
            $user->setRoles($roles);
            $user->setEnabled(true);
            $user->setRegisteredAt(new \DateTime('2024-01-01'));
            $user->setPreferenceValue(UserPreference::HOURLY_RATE, 75);
            $user->setLanguage('zh_CN');
            $user->setLocale('zh_CN');
            $user->setTimezone('Asia/Shanghai');
            $user->setPassword($this->passwordHasher->hashPassword($user, UserFixtures::DEFAULT_PASSWORD));
            $user->setApiToken($this->passwordHasher->hashPassword($user, UserFixtures::DEFAULT_API_TOKEN));

            foreach (User::WIZARDS as $wizard) {
                $user->setWizardAsSeen($wizard);
            }

            $token = new AccessToken($user, UserFixtures::DEFAULT_API_TOKEN . $tokenSuffix);
            $token->setName('Minimal demo fixture');

            $users[] = [$user, $token];
        }

        return $users;
    }

    private function createTimesheet(
        ClassicRateCalculator $calculator,
        User $user,
        Activity $activity,
        Project $project,
        string $description,
        int $daysAgo,
        int $minutes,
    ): Timesheet {
        $begin = new \DateTimeImmutable(sprintf('%d days', $daysAgo));
        $begin = $begin->setTime(9, 0);
        $end = $begin->modify('+' . $minutes . ' minutes');
        $duration = $end->getTimestamp() - $begin->getTimestamp();
        $hourlyRate = (float) $user->getPreferenceValue(UserPreference::HOURLY_RATE);

        $timesheet = new Timesheet();
        $timesheet->setUser($user);
        $timesheet->setActivity($activity);
        $timesheet->setProject($activity->getProject() ?? $project);
        $timesheet->setDescription($description);
        $timesheet->setBegin(\DateTime::createFromImmutable($begin));
        $timesheet->setEnd(\DateTime::createFromImmutable($end));
        $timesheet->setDuration($duration);
        $timesheet->setRate($calculator->calculateRate($hourlyRate, $duration));
        $timesheet->setBillable(true);

        return $timesheet;
    }
}

<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Tests\API;

use App\Attendance\AttendanceImportService;
use App\Entity\User;
use PHPUnit\Framework\Attributes\Group;
use Symfony\Component\HttpFoundation\Response;

#[Group('integration')]
final class AttendanceControllerTest extends APIControllerBaseTestCase
{
    public function testIsSecure(): void
    {
        $this->assertUrlIsSecured('/api/attendance');
    }

    public function testGetCollection(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_USER);
        $this->importRecordForUser($this->getUserByRole(User::ROLE_USER));

        $this->assertAccessIsGranted($client, '/api/attendance', 'GET', [
            'begin' => '2026-06-01',
            'end' => '2026-06-30',
        ]);

        $content = $client->getResponse()->getContent();
        self::assertIsString($content);
        $result = json_decode($content, true);

        self::assertIsArray($result);
        self::assertCount(1, $result);
        self::assertApiResponseTypeStructure('AttendanceCollection', $result[0]);
        self::assertSame('A', $result[0]['shift']);
    }

    public function testGetCollectionForOtherUserAsTeamlead(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_TEAMLEAD);
        $user = $this->getUserByRole(User::ROLE_USER);
        $this->importRecordForUser($user);

        $this->assertAccessIsGranted($client, '/api/attendance', 'GET', [
            'user' => $user->getId(),
            'begin' => '2026-06-01',
            'end' => '2026-06-30',
        ]);

        $content = $client->getResponse()->getContent();
        self::assertIsString($content);
        $result = json_decode($content, true);

        self::assertIsArray($result);
        self::assertCount(1, $result);
        self::assertSame($user->getId(), $result[0]['user']);
    }

    public function testGetCollectionForOtherUserDeniedForRegularUser(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_USER);
        $admin = $this->getUserByRole(User::ROLE_ADMIN);

        $this->request($client, '/api/attendance', 'GET', [
            'user' => $admin->getId(),
            'begin' => '2026-06-01',
            'end' => '2026-06-30',
        ]);

        $this->assertApiException($client->getResponse(), [
            'code' => Response::HTTP_FORBIDDEN,
            'message' => 'Forbidden',
        ]);
    }

    public function testImportAction(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_USER);
        $data = [
            'source' => 'external',
            'records' => [
                [
                    'date' => '2026-07-01',
                    'clock_in' => '2026-07-01 08:45:00',
                    'clock_out' => '2026-07-01 18:00:00',
                    'external_id' => 'ext-001',
                ],
            ],
        ];

        $this->request($client, '/api/attendance/import', 'POST', [], json_encode($data));
        self::assertTrue($client->getResponse()->isSuccessful());

        $content = $client->getResponse()->getContent();
        self::assertIsString($content);
        $result = json_decode($content, true);

        self::assertApiResponseTypeStructure('AttendanceImportResult', $result);
        self::assertSame(1, $result['imported']);

        $this->assertAccessIsGranted($client, '/api/attendance', 'GET', [
            'begin' => '2026-07-01',
            'end' => '2026-07-01',
        ]);

        $content = $client->getResponse()->getContent();
        self::assertIsString($content);
        $records = json_decode($content, true);
        self::assertCount(1, $records);
        self::assertSame('external', $records[0]['externalSource']);
        self::assertSame('ext-001', $records[0]['externalId']);
    }

    public function testImportActionForOtherUserAsAdmin(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_ADMIN);
        $user = $this->getUserByRole(User::ROLE_USER);
        $data = [
            'user' => $user->getId(),
            'source' => 'hr-system',
            'records' => [
                [
                    'date' => '2026-07-02',
                    'clock_in' => '2026-07-02 09:10:00',
                    'clock_out' => '2026-07-02 18:30:00',
                ],
            ],
        ];

        $this->request($client, '/api/attendance/import', 'POST', [], json_encode($data));
        self::assertTrue($client->getResponse()->isSuccessful());

        $content = $client->getResponse()->getContent();
        self::assertIsString($content);
        $result = json_decode($content, true);
        self::assertSame(1, $result['imported']);
    }

    public function testImportActionForOtherUserDeniedForRegularUser(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_USER);
        $admin = $this->getUserByRole(User::ROLE_ADMIN);
        $data = [
            'user' => $admin->getId(),
            'records' => [
                ['date' => '2026-07-03', 'clock_in' => '2026-07-03 08:00:00'],
            ],
        ];

        $this->request($client, '/api/attendance/import', 'POST', [], json_encode($data));

        $this->assertApiException($client->getResponse(), [
            'code' => Response::HTTP_FORBIDDEN,
            'message' => 'Forbidden',
        ]);
    }

    public function testImportActionValidationError(): void
    {
        $client = $this->getClientForAuthenticatedUser(User::ROLE_USER);
        $data = [
            'records' => [],
        ];

        $this->request($client, '/api/attendance/import', 'POST', [], json_encode($data));
        self::assertSame(Response::HTTP_BAD_REQUEST, $client->getResponse()->getStatusCode());
        $this->assertApiCallValidationError($client->getResponse(), ['records']);
    }

    private function importRecordForUser(User $user): void
    {
        /** @var AttendanceImportService $service */
        $service = self::getContainer()->get(AttendanceImportService::class);
        $service->importForUser($user, [
            [
                'date' => '2026-06-30',
                'clock_in' => '2026-06-30 08:50:00',
                'clock_out' => '2026-06-30 18:05:00',
            ],
        ], 'demo');
    }
}

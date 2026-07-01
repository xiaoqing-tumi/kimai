<?php

/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace DoctrineMigrations;

use App\Doctrine\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

final class Version20260630120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Adds attendance records table for external clock-in data';
    }

    public function up(Schema $schema): void
    {
        if ($schema->hasTable('kimai2_attendance_records')) {
            $this->preventEmptyMigrationWarning(false);

            return;
        }

        $table = $schema->createTable('kimai2_attendance_records');
        $table->addColumn('id', 'integer', ['autoincrement' => true, 'notnull' => true]);
        $table->addColumn('user_id', 'integer', ['notnull' => true]);
        $table->addColumn('attendance_date', 'date_immutable', ['notnull' => true]);
        $table->addColumn('clock_in', 'datetime', ['notnull' => false]);
        $table->addColumn('clock_out', 'datetime', ['notnull' => false]);
        $table->addColumn('external_source', 'string', ['length' => 100, 'notnull' => false]);
        $table->addColumn('external_id', 'string', ['length' => 255, 'notnull' => false]);
        $table->addColumn('synced_at', 'datetime', ['notnull' => false]);
        $table->setPrimaryKey(['id']);
        $table->addUniqueIndex(['user_id', 'attendance_date'], 'attendance_user_date_unique');
        $table->addIndex(['attendance_date'], 'attendance_date_idx');
        $table->addForeignKeyConstraint('kimai2_users', ['user_id'], ['id'], ['onDelete' => 'CASCADE']);

        $this->preventEmptyMigrationWarning(false);
    }

    public function down(Schema $schema): void
    {
        if ($schema->hasTable('kimai2_attendance_records')) {
            $schema->dropTable('kimai2_attendance_records');
        }

        $this->preventEmptyMigrationWarning(false);
    }

    public function isTransactional(): bool
    {
        return false;
    }
}

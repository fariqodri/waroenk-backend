import {MigrationInterface, QueryRunner} from "typeorm";

export class addCreatedAtUpdatedAtAndIsActiveToUsersAndSeller1593880880721 implements MigrationInterface {
    name = 'addCreatedAtUpdatedAtAndIsActiveToUsersAndSeller1593880880721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `users` ADD `updated_at` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `users` ADD `is_active` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `seller` ADD `image` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `seller` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `seller` ADD `updated_at` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `seller` ADD `is_active` tinyint NOT NULL DEFAULT 1");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `is_active`");
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `created_at`");
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `image`");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `is_active`");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `created_at`");
    }

}

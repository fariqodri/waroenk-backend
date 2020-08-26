import {MigrationInterface, QueryRunner} from "typeorm";

export class addBlockedAndActivationDateSeller1598425666350 implements MigrationInterface {
    name = 'addBlockedAndActivationDateSeller1598425666350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` ADD `is_blocked` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `seller` ADD `activation_date` datetime NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `activation_date`");
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `is_blocked`");
    }

}

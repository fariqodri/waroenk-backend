import {MigrationInterface, QueryRunner} from "typeorm";

export class changeProposalIsActive1598801929389 implements MigrationInterface {
    name = 'changeProposalIsActive1598801929389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `proposalData` CHANGE `deleted_at` `is_active` datetime NULL");
        await queryRunner.query("ALTER TABLE `proposal` CHANGE `deleted_at` `is_active` datetime NULL");
        await queryRunner.query("ALTER TABLE `proposalItem` CHANGE `deleted_at` `is_active` datetime NULL");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `proposalData` DROP COLUMN `is_active`");
        await queryRunner.query("ALTER TABLE `proposalData` ADD `is_active` tinyint NOT NULL DEFAULT 1");
        await queryRunner.query("ALTER TABLE `proposal` DROP COLUMN `is_active`");
        await queryRunner.query("ALTER TABLE `proposal` ADD `is_active` tinyint NOT NULL DEFAULT 1");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `proposalItem` DROP COLUMN `is_active`");
        await queryRunner.query("ALTER TABLE `proposalItem` ADD `is_active` tinyint NOT NULL DEFAULT 1");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `proposalItem` DROP COLUMN `is_active`");
        await queryRunner.query("ALTER TABLE `proposalItem` ADD `is_active` datetime NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `proposal` DROP COLUMN `is_active`");
        await queryRunner.query("ALTER TABLE `proposal` ADD `is_active` datetime NULL");
        await queryRunner.query("ALTER TABLE `proposalData` DROP COLUMN `is_active`");
        await queryRunner.query("ALTER TABLE `proposalData` ADD `is_active` datetime NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL");
        await queryRunner.query("ALTER TABLE `proposalItem` CHANGE `is_active` `deleted_at` datetime NULL");
        await queryRunner.query("ALTER TABLE `proposal` CHANGE `is_active` `deleted_at` datetime NULL");
        await queryRunner.query("ALTER TABLE `proposalData` CHANGE `is_active` `deleted_at` datetime NULL");
    }

}

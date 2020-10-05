import {MigrationInterface, QueryRunner} from "typeorm";

export class changeTypeToLongtext1601913758100 implements MigrationInterface {
    name = 'changeTypeToLongtext1601913758100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `posts` CHANGE `image` `image` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `agendas` DROP COLUMN `description`");
        await queryRunner.query("ALTER TABLE `agendas` ADD `description` longtext NOT NULL");
        await queryRunner.query("ALTER TABLE `faq` DROP COLUMN `description`");
        await queryRunner.query("ALTER TABLE `faq` ADD `description` longtext NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `faq` DROP COLUMN `description`");
        await queryRunner.query("ALTER TABLE `faq` ADD `description` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `agendas` DROP COLUMN `description`");
        await queryRunner.query("ALTER TABLE `agendas` ADD `description` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL");
        await queryRunner.query("ALTER TABLE `posts` CHANGE `image` `image` varchar(255) NULL");
    }

}

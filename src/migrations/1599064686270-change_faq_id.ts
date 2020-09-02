import {MigrationInterface, QueryRunner} from "typeorm";

export class changeFaqId1599064686270 implements MigrationInterface {
    name = 'changeFaqId1599064686270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `faq` CHANGE `id` `id` int NOT NULL");
        await queryRunner.query("ALTER TABLE `faq` DROP PRIMARY KEY");
        await queryRunner.query("ALTER TABLE `faq` DROP COLUMN `id`");
        await queryRunner.query("ALTER TABLE `faq` ADD `id` varchar(255) NOT NULL PRIMARY KEY");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `faq` DROP COLUMN `id`");
        await queryRunner.query("ALTER TABLE `faq` ADD `id` int NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `faq` ADD PRIMARY KEY (`id`)");
        await queryRunner.query("ALTER TABLE `faq` CHANGE `id` `id` int NOT NULL AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL");
    }

}

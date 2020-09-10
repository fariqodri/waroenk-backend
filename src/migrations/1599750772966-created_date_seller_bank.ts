import {MigrationInterface, QueryRunner} from "typeorm";

export class createdDateSellerBank1599750772966 implements MigrationInterface {
    name = 'createdDateSellerBank1599750772966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller_bank` ADD `created_at` datetime NOT NULL");
        await queryRunner.query("ALTER TABLE `seller_bank` ADD `updated_at` datetime NULL");
        await queryRunner.query("ALTER TABLE `posts` CHANGE `image` `image` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL");
        await queryRunner.query("ALTER TABLE `posts` CHANGE `image` `image` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `seller_bank` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `seller_bank` DROP COLUMN `created_at`");
    }

}

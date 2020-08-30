import {MigrationInterface, QueryRunner} from "typeorm";

export class addSellerBank1598765397077 implements MigrationInterface {
    name = 'addSellerBank1598765397077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `seller_bank` (`id` varchar(255) NOT NULL, `bank` varchar(255) NOT NULL, `number` varchar(255) NOT NULL, `owner` varchar(255) NOT NULL, `is_active` tinyint NOT NULL DEFAULT 1, `sellerId` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `seller_bank` ADD CONSTRAINT `FK_bff55ba37d5a2618a4ebffa2504` FOREIGN KEY (`sellerId`) REFERENCES `seller`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller_bank` DROP FOREIGN KEY `FK_bff55ba37d5a2618a4ebffa2504`");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL");
        await queryRunner.query("DROP TABLE `seller_bank`");
    }

}

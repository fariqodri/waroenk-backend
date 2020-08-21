import {MigrationInterface, QueryRunner} from "typeorm";

export class addChatReadReceipt1597998215375 implements MigrationInterface {
    name = 'addChatReadReceipt1597998215375'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `chats` ADD `read_by_receiver` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `chats` DROP COLUMN `read_by_receiver`");
    }

}

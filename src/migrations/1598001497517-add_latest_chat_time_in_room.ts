import {MigrationInterface, QueryRunner} from "typeorm";

export class addLatestChatTimeInRoom1598001497517 implements MigrationInterface {
    name = 'addLatestChatTimeInRoom1598001497517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `chat_rooms` CHANGE `created_at` `latest_chat_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP COLUMN `latest_chat_at`");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD `latest_chat_at` bigint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP COLUMN `latest_chat_at`");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD `latest_chat_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `chat_rooms` CHANGE `latest_chat_at` `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
    }

}

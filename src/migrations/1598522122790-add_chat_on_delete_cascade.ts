import {MigrationInterface, QueryRunner} from "typeorm";

export class addChatOnDeleteCascade1598522122790 implements MigrationInterface {
    name = 'addChatOnDeleteCascade1598522122790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `chats` DROP FOREIGN KEY `FK_60105616b7efccd8c51808d777f`");
        await queryRunner.query("ALTER TABLE `chats` DROP FOREIGN KEY `FK_f86c9c1f5005868819354f0ae9e`");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chats` ADD CONSTRAINT `FK_f86c9c1f5005868819354f0ae9e` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `chats` ADD CONSTRAINT `FK_60105616b7efccd8c51808d777f` FOREIGN KEY (`roomId`) REFERENCES `chat_rooms`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `chats` DROP FOREIGN KEY `FK_60105616b7efccd8c51808d777f`");
        await queryRunner.query("ALTER TABLE `chats` DROP FOREIGN KEY `FK_f86c9c1f5005868819354f0ae9e`");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL");
        await queryRunner.query("ALTER TABLE `chats` ADD CONSTRAINT `FK_f86c9c1f5005868819354f0ae9e` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `chats` ADD CONSTRAINT `FK_60105616b7efccd8c51808d777f` FOREIGN KEY (`roomId`) REFERENCES `chat_rooms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}

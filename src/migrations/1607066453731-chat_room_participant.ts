import {MigrationInterface, QueryRunner} from "typeorm";

export class chatRoomParticipant1607066453731 implements MigrationInterface {
    name = 'chatRoomParticipant1607066453731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP FOREIGN KEY `FK_6cd8644ed18e93f4ab988ee9d5d`");
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP FOREIGN KEY `FK_eb20ae872288ed475f7314a0a06`");
        await queryRunner.query("DROP INDEX `IDX_ae411bb06faa6c3f073bd74bf7` ON `chat_rooms`");
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP COLUMN `buyerId`");
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP COLUMN `sellerId`");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD `participantOneId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD `participantTwoId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `posts` CHANGE `image` `image` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_12ea80dd3ebae06bdd7c22f680` ON `chat_rooms` (`participantOneId`, `participantTwoId`)");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD CONSTRAINT `FK_e8d6d1bef39638d877c6a4458ca` FOREIGN KEY (`participantOneId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD CONSTRAINT `FK_8bfab9dcc891e0da23879f960ec` FOREIGN KEY (`participantTwoId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP FOREIGN KEY `FK_8bfab9dcc891e0da23879f960ec`");
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP FOREIGN KEY `FK_e8d6d1bef39638d877c6a4458ca`");
        await queryRunner.query("DROP INDEX `IDX_12ea80dd3ebae06bdd7c22f680` ON `chat_rooms`");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL");
        await queryRunner.query("ALTER TABLE `posts` CHANGE `image` `image` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP COLUMN `participantTwoId`");
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP COLUMN `participantOneId`");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD `sellerId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD `buyerId` varchar(255) NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_ae411bb06faa6c3f073bd74bf7` ON `chat_rooms` (`buyerId`, `sellerId`)");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD CONSTRAINT `FK_eb20ae872288ed475f7314a0a06` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD CONSTRAINT `FK_6cd8644ed18e93f4ab988ee9d5d` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}

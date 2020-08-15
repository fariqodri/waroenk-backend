import {MigrationInterface, QueryRunner} from "typeorm";

export class chats1597477584202 implements MigrationInterface {
    name = 'chats1597477584202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `chats` (`id` varchar(255) NOT NULL, `date` date NOT NULL, `time` time NOT NULL, `text` text NULL DEFAULT NULL, `orderId` varchar(255) NULL, `roomId` varchar(255) NULL, `senderId` varchar(255) NULL, `receiverId` varchar(255) NULL, INDEX `IDX_9136256bea46a942e8ce6d91d3` (`date`, `time`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `chat_rooms` (`id` varchar(255) NOT NULL, `buyerId` varchar(255) NULL, `sellerId` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `users` ADD `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chats` ADD CONSTRAINT `FK_f86c9c1f5005868819354f0ae9e` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `chats` ADD CONSTRAINT `FK_60105616b7efccd8c51808d777f` FOREIGN KEY (`roomId`) REFERENCES `chat_rooms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `chats` ADD CONSTRAINT `FK_d697f19c9c7778ed773b449ce70` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `chats` ADD CONSTRAINT `FK_c8562e07e5260b76b37e25126c6` FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD CONSTRAINT `FK_eb20ae872288ed475f7314a0a06` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `chat_rooms` ADD CONSTRAINT `FK_6cd8644ed18e93f4ab988ee9d5d` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP FOREIGN KEY `FK_6cd8644ed18e93f4ab988ee9d5d`");
        await queryRunner.query("ALTER TABLE `chat_rooms` DROP FOREIGN KEY `FK_eb20ae872288ed475f7314a0a06`");
        await queryRunner.query("ALTER TABLE `chats` DROP FOREIGN KEY `FK_c8562e07e5260b76b37e25126c6`");
        await queryRunner.query("ALTER TABLE `chats` DROP FOREIGN KEY `FK_d697f19c9c7778ed773b449ce70`");
        await queryRunner.query("ALTER TABLE `chats` DROP FOREIGN KEY `FK_60105616b7efccd8c51808d777f`");
        await queryRunner.query("ALTER TABLE `chats` DROP FOREIGN KEY `FK_f86c9c1f5005868819354f0ae9e`");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `device_token`");
        await queryRunner.query("DROP TABLE `chat_rooms`");
        await queryRunner.query("DROP INDEX `IDX_9136256bea46a942e8ce6d91d3` ON `chats`");
        await queryRunner.query("DROP TABLE `chats`");
    }

}

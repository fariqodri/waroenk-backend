import {MigrationInterface, QueryRunner} from "typeorm";

export class addUserConfirmationTable1605459145425 implements MigrationInterface {
    name = 'addUserConfirmationTable1605459145425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user_confirmation` (`code` varchar(255) NOT NULL, `userId` varchar(255) NULL, UNIQUE INDEX `REL_3c15304649ca2ab532ccb9990a` (`userId`), PRIMARY KEY (`code`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `posts` CHANGE `image` `image` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `user_confirmation` ADD CONSTRAINT `FK_3c15304649ca2ab532ccb9990a1` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_confirmation` DROP FOREIGN KEY `FK_3c15304649ca2ab532ccb9990a1`");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `image_url` `image_url` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `discount` `discount` decimal(5,2) NOT NULL DEFAULT '0.00'");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `activation_date` `activation_date` datetime NULL");
        await queryRunner.query("ALTER TABLE `posts` CHANGE `image` `image` varchar(255) NULL");
        await queryRunner.query("DROP INDEX `REL_3c15304649ca2ab532ccb9990a` ON `user_confirmation`");
        await queryRunner.query("DROP TABLE `user_confirmation`");
    }

}

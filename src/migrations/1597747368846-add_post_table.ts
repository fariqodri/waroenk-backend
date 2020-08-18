import {MigrationInterface, QueryRunner} from "typeorm";

export class addPostTable1597747368846 implements MigrationInterface {
    name = 'addPostTable1597747368846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `posts` (`id` varchar(255) NOT NULL, `title` varchar(255) NOT NULL, `content` text NOT NULL, `sellerId` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `posts` ADD CONSTRAINT `FK_7cb2f32ca27d8eafbc881bd5e0d` FOREIGN KEY (`sellerId`) REFERENCES `seller`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `posts` DROP FOREIGN KEY `FK_7cb2f32ca27d8eafbc881bd5e0d`");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("DROP TABLE `posts`");
    }

}

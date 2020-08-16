import {MigrationInterface, QueryRunner} from "typeorm";

export class changeDateTypeAgenda1597596319010 implements MigrationInterface {
    name = 'changeDateTypeAgenda1597596319010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `agendas` DROP COLUMN `date`");
        await queryRunner.query("ALTER TABLE `agendas` ADD `date` datetime NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `agendas` DROP COLUMN `date`");
        await queryRunner.query("ALTER TABLE `agendas` ADD `date` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
    }

}

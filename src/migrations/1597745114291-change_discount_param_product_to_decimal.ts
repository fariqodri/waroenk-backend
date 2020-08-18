import {MigrationInterface, QueryRunner} from "typeorm";

export class changeDiscountParamProductToDecimal1597745114291 implements MigrationInterface {
    name = 'changeDiscountParamProductToDecimal1597745114291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `discount`");
        await queryRunner.query("ALTER TABLE `product` ADD `discount` decimal NOT NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `discount`");
        await queryRunner.query("ALTER TABLE `product` ADD `discount` int NOT NULL");
    }

}

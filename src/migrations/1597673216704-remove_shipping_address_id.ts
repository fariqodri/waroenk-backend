import {MigrationInterface, QueryRunner} from "typeorm";

export class removeShippingAddressId1597673216704 implements MigrationInterface {
    name = 'removeShippingAddressId1597673216704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `shipping_address` DROP PRIMARY KEY");
        await queryRunner.query("ALTER TABLE `shipping_address` DROP COLUMN `id`");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `shipping_address` DROP FOREIGN KEY `FK_2aa99b101de6fb5f3089bd4b7a9`");
        await queryRunner.query("ALTER TABLE `shipping_address` CHANGE `userId` `userId` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `shipping_address` ADD PRIMARY KEY (`userId`)");
        await queryRunner.query("ALTER TABLE `shipping_address` ADD CONSTRAINT `FK_2aa99b101de6fb5f3089bd4b7a9` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `shipping_address` DROP FOREIGN KEY `FK_2aa99b101de6fb5f3089bd4b7a9`");
        await queryRunner.query("ALTER TABLE `shipping_address` DROP PRIMARY KEY");
        await queryRunner.query("ALTER TABLE `shipping_address` CHANGE `userId` `userId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `shipping_address` ADD CONSTRAINT `FK_2aa99b101de6fb5f3089bd4b7a9` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("ALTER TABLE `shipping_address` ADD `id` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `shipping_address` ADD PRIMARY KEY (`id`)");
    }

}

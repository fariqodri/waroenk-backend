import {MigrationInterface, QueryRunner} from "typeorm";

export class shippingAddress1597645459207 implements MigrationInterface {
    name = 'shippingAddress1597645459207'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `shipping_address` (`id` varchar(255) NOT NULL, `receiver_name` varchar(255) NOT NULL, `receiver_phone` varchar(255) NOT NULL, `street` varchar(255) NOT NULL, `post_code` varchar(255) NOT NULL, `cityKode` varchar(255) NULL, `kecamatanKode` varchar(255) NULL, `kelurahanKode` varchar(255) NULL, `userId` varchar(255) NULL, UNIQUE INDEX `REL_2aa99b101de6fb5f3089bd4b7a` (`userId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `shipping_address` ADD CONSTRAINT `FK_ec5120f079c93dd3ef7d072b354` FOREIGN KEY (`cityKode`) REFERENCES `location`(`kode`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `shipping_address` ADD CONSTRAINT `FK_5a179bacc6820758daed9d02dda` FOREIGN KEY (`kecamatanKode`) REFERENCES `location`(`kode`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `shipping_address` ADD CONSTRAINT `FK_b6fcf216b5766455c872597d3b0` FOREIGN KEY (`kelurahanKode`) REFERENCES `location`(`kode`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `shipping_address` ADD CONSTRAINT `FK_2aa99b101de6fb5f3089bd4b7a9` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `shipping_address` DROP FOREIGN KEY `FK_2aa99b101de6fb5f3089bd4b7a9`");
        await queryRunner.query("ALTER TABLE `shipping_address` DROP FOREIGN KEY `FK_b6fcf216b5766455c872597d3b0`");
        await queryRunner.query("ALTER TABLE `shipping_address` DROP FOREIGN KEY `FK_5a179bacc6820758daed9d02dda`");
        await queryRunner.query("ALTER TABLE `shipping_address` DROP FOREIGN KEY `FK_ec5120f079c93dd3ef7d072b354`");
        await queryRunner.query("ALTER TABLE `users` CHANGE `device_token` `device_token` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `chats` CHANGE `text` `text` text NULL");
        await queryRunner.query("DROP INDEX `REL_2aa99b101de6fb5f3089bd4b7a` ON `shipping_address`");
        await queryRunner.query("DROP TABLE `shipping_address`");
    }

}

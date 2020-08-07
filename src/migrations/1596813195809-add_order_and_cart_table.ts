import {MigrationInterface, QueryRunner} from "typeorm";

export class addOrderAndCartTable1596813195809 implements MigrationInterface {
    name = 'addOrderAndCartTable1596813195809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `orderItem` (`quantity` int NOT NULL DEFAULT 0, `productId` varchar(255) NOT NULL, `orderId` varchar(255) NOT NULL, PRIMARY KEY (`productId`, `orderId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `order` (`id` varchar(255) NOT NULL, `status` varchar(255) NOT NULL, `address` varchar(255) NOT NULL, `fare` int NOT NULL DEFAULT 0, `courier` varchar(255) NULL, `notes` varchar(255) NULL, `payment_bank` varchar(255) NULL, `account_owner` varchar(255) NULL, `account_number` varchar(255) NULL, `payment_proof` varchar(255) NULL, `receipt_number` varchar(255) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `is_active` tinyint NOT NULL, `userId` varchar(255) NULL, `sellerId` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `cart` (`quantity` int NOT NULL DEFAULT 0, `is_active` tinyint NOT NULL, `productId` varchar(255) NOT NULL, `userId` varchar(255) NOT NULL, PRIMARY KEY (`productId`, `userId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `orderItem` ADD CONSTRAINT `FK_aa1c5296e561dbd599ed0f0e860` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `orderItem` ADD CONSTRAINT `FK_ef8ed42ef2c6feafd1447d96279` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `order` ADD CONSTRAINT `FK_caabe91507b3379c7ba73637b84` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `order` ADD CONSTRAINT `FK_8a583acc24e13bcf84b1b9d0d20` FOREIGN KEY (`sellerId`) REFERENCES `seller`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `cart` ADD CONSTRAINT `FK_371eb56ecc4104c2644711fa85f` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `cart` ADD CONSTRAINT `FK_756f53ab9466eb52a52619ee019` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `cart` DROP FOREIGN KEY `FK_756f53ab9466eb52a52619ee019`");
        await queryRunner.query("ALTER TABLE `cart` DROP FOREIGN KEY `FK_371eb56ecc4104c2644711fa85f`");
        await queryRunner.query("ALTER TABLE `order` DROP FOREIGN KEY `FK_8a583acc24e13bcf84b1b9d0d20`");
        await queryRunner.query("ALTER TABLE `order` DROP FOREIGN KEY `FK_caabe91507b3379c7ba73637b84`");
        await queryRunner.query("ALTER TABLE `orderItem` DROP FOREIGN KEY `FK_ef8ed42ef2c6feafd1447d96279`");
        await queryRunner.query("ALTER TABLE `orderItem` DROP FOREIGN KEY `FK_aa1c5296e561dbd599ed0f0e860`");
        await queryRunner.query("DROP TABLE `cart`");
        await queryRunner.query("DROP TABLE `order`");
        await queryRunner.query("DROP TABLE `orderItem`");
    }

}

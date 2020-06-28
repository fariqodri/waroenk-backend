import {MigrationInterface, QueryRunner} from "typeorm";

export class init1593320262175 implements MigrationInterface {
    name = 'init1593320262175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `users` (`id` varchar(255) NOT NULL, `full_name` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `phone` varchar(255) NOT NULL, `role` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `seller` (`id` varchar(255) NOT NULL, `shop_name` varchar(255) NOT NULL, `shop_address` varchar(255) NOT NULL, `birth_date` date NOT NULL, `birth_place` varchar(255) NOT NULL, `gender` varchar(255) NOT NULL, `userId` varchar(255) NULL, UNIQUE INDEX `REL_af49645e98a3d39bd4f3591b33` (`userId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `product` (`id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `price_per_quantity` int NOT NULL, `discount` int NOT NULL, `description` varchar(255) NOT NULL, `images` text NOT NULL, `categoryId` varchar(255) NULL, `sellerId` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `categories` (`id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `image` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `seller` ADD CONSTRAINT `FK_af49645e98a3d39bd4f3591b334` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `product` ADD CONSTRAINT `FK_ff0c0301a95e517153df97f6812` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `product` ADD CONSTRAINT `FK_d5cac481d22dacaf4d53f900a3f` FOREIGN KEY (`sellerId`) REFERENCES `seller`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` DROP FOREIGN KEY `FK_d5cac481d22dacaf4d53f900a3f`");
        await queryRunner.query("ALTER TABLE `product` DROP FOREIGN KEY `FK_ff0c0301a95e517153df97f6812`");
        await queryRunner.query("ALTER TABLE `seller` DROP FOREIGN KEY `FK_af49645e98a3d39bd4f3591b334`");
        await queryRunner.query("DROP TABLE `categories`");
        await queryRunner.query("DROP TABLE `product`");
        await queryRunner.query("DROP INDEX `REL_af49645e98a3d39bd4f3591b33` ON `seller`");
        await queryRunner.query("DROP TABLE `seller`");
        await queryRunner.query("DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`");
        await queryRunner.query("DROP TABLE `users`");
    }

}

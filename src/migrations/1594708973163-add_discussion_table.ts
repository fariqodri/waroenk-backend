import {MigrationInterface, QueryRunner} from "typeorm";

export class addDiscussionTable1594708973163 implements MigrationInterface {
    name = 'addDiscussionTable1594708973163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `discussions` (`id` varchar(255) NOT NULL, `title` varchar(255) NOT NULL, `description` varchar(255) NOT NULL, `images` text NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `deleted_at` datetime NULL, `userId` varchar(255) NULL, `productId` varchar(255) NULL, `parentId` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `discussions` ADD CONSTRAINT `FK_eb6ce1d577cf596f98bb230b8b6` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `discussions` ADD CONSTRAINT `FK_434c414898bb203cd9b6393f276` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `discussions` ADD CONSTRAINT `FK_b13da107d682871e171ed944d3a` FOREIGN KEY (`parentId`) REFERENCES `discussions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `discussions` DROP FOREIGN KEY `FK_b13da107d682871e171ed944d3a`");
        await queryRunner.query("ALTER TABLE `discussions` DROP FOREIGN KEY `FK_434c414898bb203cd9b6393f276`");
        await queryRunner.query("ALTER TABLE `discussions` DROP FOREIGN KEY `FK_eb6ce1d577cf596f98bb230b8b6`");
        await queryRunner.query("DROP TABLE `discussions`");
    }

}

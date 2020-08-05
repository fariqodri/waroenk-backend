import {MigrationInterface, QueryRunner} from "typeorm";

export class addProposalTables1596642976601 implements MigrationInterface {
    name = 'addProposalTables1596642976601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `proposalData` (`id` varchar(255) NOT NULL, `key` varchar(255) NOT NULL, `value` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deleted_at` datetime NULL, `proposalId` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `proposal` (`id` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deleted_at` datetime NULL, `userId` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `proposalItem` (`id` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, `item` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deleted_at` datetime NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `proposalData` ADD CONSTRAINT `FK_89e5508eb02dcef34eab9a2c9d9` FOREIGN KEY (`proposalId`) REFERENCES `proposal`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `proposal` ADD CONSTRAINT `FK_de14a768fe600bb1e723b32377e` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `proposal` DROP FOREIGN KEY `FK_de14a768fe600bb1e723b32377e`");
        await queryRunner.query("ALTER TABLE `proposalData` DROP FOREIGN KEY `FK_89e5508eb02dcef34eab9a2c9d9`");
        await queryRunner.query("DROP TABLE `proposalItem`");
        await queryRunner.query("DROP TABLE `proposal`");
        await queryRunner.query("DROP TABLE `proposalData`");
    }

}

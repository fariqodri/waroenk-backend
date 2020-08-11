import {MigrationInterface, QueryRunner} from "typeorm";

export class refineOrderTable1597152434051 implements MigrationInterface {
    name = 'refineOrderTable1597152434051'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `is_active`");
        await queryRunner.query("ALTER TABLE `order` ADD `recipient_name` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `order` ADD `recipient_number` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `recipient_number`");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `recipient_name`");
        await queryRunner.query("ALTER TABLE `order` ADD `is_active` tinyint NOT NULL");
    }

}

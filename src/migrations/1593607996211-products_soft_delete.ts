import {MigrationInterface, QueryRunner} from "typeorm";

export class productsSoftDelete1593607996211 implements MigrationInterface {
    name = 'productsSoftDelete1593607996211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` ADD `deleted_at` datetime NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `deleted_at`");
    }

}

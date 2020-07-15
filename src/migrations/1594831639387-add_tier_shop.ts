import {MigrationInterface, QueryRunner} from "typeorm";

export class addTierShop1594831639387 implements MigrationInterface {
    name = 'addTierShop1594831639387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` ADD `tier` int NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `tier`");
    }

}

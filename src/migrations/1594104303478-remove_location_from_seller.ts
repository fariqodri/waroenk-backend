import {MigrationInterface, QueryRunner} from "typeorm";

export class removeLocationFromSeller1594104303478 implements MigrationInterface {
    name = 'removeLocationFromSeller1594104303478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `location`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` ADD `location` varchar(255) NOT NULL");
    }

}

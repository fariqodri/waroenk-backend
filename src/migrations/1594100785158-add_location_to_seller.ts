import {MigrationInterface, QueryRunner} from "typeorm";

export class addLocationToSeller1594100785158 implements MigrationInterface {
    name = 'addLocationToSeller1594100785158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` ADD `location` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `location`");
    }

}

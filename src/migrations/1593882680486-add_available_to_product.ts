import {MigrationInterface, QueryRunner} from "typeorm";

export class addAvailableToProduct1593882680486 implements MigrationInterface {
    name = 'addAvailableToProduct1593882680486'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` ADD `available` tinyint NOT NULL DEFAULT 1");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `available`");
    }

}

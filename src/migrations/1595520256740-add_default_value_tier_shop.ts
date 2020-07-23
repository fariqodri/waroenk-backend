import {MigrationInterface, QueryRunner} from "typeorm";

export class addDefaultValueTierShop1595520256740 implements MigrationInterface {
    name = 'addDefaultValueTierShop1595520256740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` CHANGE `tier` `tier` int NOT NULL DEFAULT 1");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` CHANGE `tier` `tier` int NOT NULL");
    }

}

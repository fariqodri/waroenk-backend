import {MigrationInterface, QueryRunner} from "typeorm";

export class addDescriptionInShop1596782382539 implements MigrationInterface {
    name = 'addDescriptionInShop1596782382539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` ADD `description` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `description`");
    }

}

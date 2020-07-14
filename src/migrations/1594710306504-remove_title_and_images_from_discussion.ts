import {MigrationInterface, QueryRunner} from "typeorm";

export class removeTitleAndImagesFromDiscussion1594710306504 implements MigrationInterface {
    name = 'removeTitleAndImagesFromDiscussion1594710306504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `discussions` DROP COLUMN `title`");
        await queryRunner.query("ALTER TABLE `discussions` DROP COLUMN `images`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `discussions` ADD `images` text NOT NULL");
        await queryRunner.query("ALTER TABLE `discussions` ADD `title` varchar(255) NOT NULL");
    }

}

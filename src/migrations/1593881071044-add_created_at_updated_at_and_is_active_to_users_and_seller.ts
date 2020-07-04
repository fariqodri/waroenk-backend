import {MigrationInterface, QueryRunner} from "typeorm";

export class addCreatedAtUpdatedAtAndIsActiveToUsersAndSeller1593881071044 implements MigrationInterface {
    name = 'addCreatedAtUpdatedAtAndIsActiveToUsersAndSeller1593881071044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `is_active` `is_active` tinyint NOT NULL DEFAULT 1");
        await queryRunner.query("ALTER TABLE `seller` CHANGE `is_active` `is_active` tinyint NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seller` CHANGE `is_active` `is_active` tinyint NOT NULL DEFAULT '1'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `is_active` `is_active` tinyint NOT NULL DEFAULT '0'");
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class addSponsorInAgenda1596646134602 implements MigrationInterface {
    name = 'addSponsorInAgenda1596646134602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `agendas` ADD `sponsors` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `agendas` DROP COLUMN `sponsors`");
    }

}

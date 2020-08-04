import {MigrationInterface, QueryRunner} from "typeorm";

export class addAgendaType1596561179530 implements MigrationInterface {
    name = 'addAgendaType1596561179530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `agendas` ADD `type` varchar(255) NOT NULL DEFAULT 'pelatihan'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `agendas` DROP COLUMN `type`");
    }

}

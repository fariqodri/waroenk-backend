import {MigrationInterface, QueryRunner} from "typeorm";

export class addAgendaTable1594233644082 implements MigrationInterface {
    name = 'addAgendaTable1594233644082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `agendas` (`id` varchar(255) NOT NULL, `title` varchar(255) NOT NULL, `description` varchar(255) NOT NULL, `location` varchar(255) NOT NULL, `date` varchar(255) NOT NULL, `images` text NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6), `is_active` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `agendas`");
    }

}

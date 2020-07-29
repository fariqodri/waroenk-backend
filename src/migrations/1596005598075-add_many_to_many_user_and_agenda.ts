import {MigrationInterface, QueryRunner} from "typeorm";

export class addManyToManyUserAndAgenda1596005598075 implements MigrationInterface {
    name = 'addManyToManyUserAndAgenda1596005598075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `users_saved_agendas_agendas` (`usersId` varchar(255) NOT NULL, `agendasId` varchar(255) NOT NULL, INDEX `IDX_c4b04aea2692d29980ece681aa` (`usersId`), INDEX `IDX_bee148b486668dd8b7ed500de4` (`agendasId`), PRIMARY KEY (`usersId`, `agendasId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `users_saved_agendas_agendas` ADD CONSTRAINT `FK_c4b04aea2692d29980ece681aa9` FOREIGN KEY (`usersId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `users_saved_agendas_agendas` ADD CONSTRAINT `FK_bee148b486668dd8b7ed500de49` FOREIGN KEY (`agendasId`) REFERENCES `agendas`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users_saved_agendas_agendas` DROP FOREIGN KEY `FK_bee148b486668dd8b7ed500de49`");
        await queryRunner.query("ALTER TABLE `users_saved_agendas_agendas` DROP FOREIGN KEY `FK_c4b04aea2692d29980ece681aa9`");
        await queryRunner.query("DROP INDEX `IDX_bee148b486668dd8b7ed500de4` ON `users_saved_agendas_agendas`");
        await queryRunner.query("DROP INDEX `IDX_c4b04aea2692d29980ece681aa` ON `users_saved_agendas_agendas`");
        await queryRunner.query("DROP TABLE `users_saved_agendas_agendas`");
    }

}

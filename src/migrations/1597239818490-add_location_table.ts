import {MigrationInterface, QueryRunner} from "typeorm";

export class addLocationTable1597239818490 implements MigrationInterface {
    name = 'addLocationTable1597239818490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `location` (`kode` varchar(255) NOT NULL, `nama` varchar(255) NOT NULL, PRIMARY KEY (`kode`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `location`");
    }

}

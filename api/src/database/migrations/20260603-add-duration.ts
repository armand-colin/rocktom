import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDuration implements MigrationInterface {
  
  name = 'AddDuration1780521212907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "level" ADD "duration" integer');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "level" DROP COLUMN "duration"');
  }
}

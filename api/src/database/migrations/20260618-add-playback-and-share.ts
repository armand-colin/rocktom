import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlaybackAndShare implements MigrationInterface {

  name = 'AddPlayback1781798239773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "level" ADD "playback_id" uuid');
    await queryRunner.query(`
      ALTER TABLE "level" 
      ADD CONSTRAINT "FK_6493ad57b3ec4a751ebd5c8fdd4" 
      FOREIGN KEY ("playback_id") 
      REFERENCES "document"("id") 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "level" DROP CONSTRAINT "FK_6493ad57b3ec4a751ebd5c8fdd4"');
    await queryRunner.query('ALTER TABLE "level" DROP COLUMN "playback_id"');
  }

}

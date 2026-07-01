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

    await queryRunner.query(`
      CREATE_TABLE "level_share" (
        "level_id" uuid NOT NULL,
        "share_code" text NOT NULL,
        CONSTRAINT "PK_level_share" PRIMARY KEY ("level_id"),
        CONSTRAINT "FK_level_share_level" FOREIGN KEY ("level_id") 
        REFERENCES "level"("id") 
        ON DELETE CASCADE 
        ON UPDATE NO ACTION
      )
    `);
    
    await queryRunner.query(`
      CREATE TABLE "level_share" (
        "level_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_level_share" PRIMARY KEY ("level_id", "user_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "level" DROP CONSTRAINT "FK_6493ad57b3ec4a751ebd5c8fdd4"');
    await queryRunner.query('ALTER TABLE "level" DROP COLUMN "playback_id"');
    await queryRunner.query('ALTER TABLE "level" DROP COLUMN "share_code"');
    await queryRunner.query('DROP TABLE "level_share"');
  }

}

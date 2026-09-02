import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstrumentTypes implements MigrationInterface {

  name = 'AddInstrumentTypes1780521212908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "level" ADD "instrument_types" text[] NOT NULL DEFAULT '{bass}'`,
    );
    await queryRunner.query(`
      UPDATE "level"
      SET "instrument_types" = ARRAY[COALESCE(serialized::json->'note'->>'instrumentType', 'bass')]
      WHERE serialized <> ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "level" DROP COLUMN "instrument_types"`);
  }

}

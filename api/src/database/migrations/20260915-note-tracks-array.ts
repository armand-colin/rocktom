import { MigrationInterface, QueryRunner } from 'typeorm';

export class NoteTracksArray implements MigrationInterface {

  name = 'NoteTracksArray1789468800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "level"
      SET serialized = (
        jsonb_set(
          serialized::jsonb - 'note',
          '{noteTracks}',
          jsonb_build_array(
            (serialized::jsonb->'note') || jsonb_build_object(
              'id', gen_random_uuid()::text,
              'name', CASE serialized::jsonb->'note'->>'instrumentType'
                WHEN 'guitar' THEN 'Guitar'
                ELSE 'Bass'
              END
            )
          )
        )
      )::text
      WHERE serialized <> ''
        AND serialized <> '{}'
        AND serialized::jsonb ? 'note'
        AND NOT (serialized::jsonb ? 'noteTracks')
        AND jsonb_typeof(serialized::jsonb->'note') = 'object'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Extra noteTracks beyond the first are dropped on revert.
    await queryRunner.query(`
      UPDATE "level"
      SET serialized = (
        jsonb_set(
          serialized::jsonb - 'noteTracks',
          '{note}',
          (serialized::jsonb->'noteTracks'->0) - 'id' - 'name'
        )
      )::text
      WHERE serialized <> ''
        AND serialized <> '{}'
        AND serialized::jsonb ? 'noteTracks'
        AND jsonb_typeof(serialized::jsonb->'noteTracks') = 'array'
        AND jsonb_array_length(serialized::jsonb->'noteTracks') >= 1
    `);
  }

}

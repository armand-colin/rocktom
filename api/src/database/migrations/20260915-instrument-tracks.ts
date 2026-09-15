import { MigrationInterface, QueryRunner } from 'typeorm';

export class InstrumentTracks implements MigrationInterface {

  name = 'InstrumentTracks1789468800001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "level"
      SET serialized = (
        (
          serialized::jsonb - 'noteTracks' - 'note' - 'focus'
        ) || jsonb_build_object(
          'instrumentTracks',
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'note', elem,
                  'focus', COALESCE(
                    serialized::jsonb->'focus',
                    '{"initialFocus":{"lowFret":0,"highFret":18},"events":[]}'::jsonb
                  )
                )
                ORDER BY ord
              )
              FROM jsonb_array_elements(
                CASE
                  WHEN jsonb_typeof(serialized::jsonb->'noteTracks') = 'array'
                    THEN serialized::jsonb->'noteTracks'
                  WHEN jsonb_typeof(serialized::jsonb->'note') = 'object'
                    THEN jsonb_build_array(serialized::jsonb->'note')
                  ELSE '[]'::jsonb
                END
              ) WITH ORDINALITY AS t(elem, ord)
            ),
            '[]'::jsonb
          )
        )
      )::text
      WHERE serialized <> ''
        AND serialized <> '{}'
        AND NOT (serialized::jsonb ? 'instrumentTracks')
        AND (
          jsonb_typeof(serialized::jsonb->'noteTracks') = 'array'
          OR jsonb_typeof(serialized::jsonb->'note') = 'object'
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Focus tracks beyond the first instrument track are dropped on revert.
    await queryRunner.query(`
      UPDATE "level"
      SET serialized = (
        (
          serialized::jsonb - 'instrumentTracks'
        ) || jsonb_build_object(
          'noteTracks',
          COALESCE(
            (
              SELECT jsonb_agg(track->'note' ORDER BY ord)
              FROM jsonb_array_elements(serialized::jsonb->'instrumentTracks')
                WITH ORDINALITY AS t(track, ord)
            ),
            '[]'::jsonb
          ),
          'focus',
          COALESCE(
            serialized::jsonb->'instrumentTracks'->0->'focus',
            '{"initialFocus":{"lowFret":0,"highFret":18},"events":[]}'::jsonb
          )
        )
      )::text
      WHERE serialized <> ''
        AND serialized <> '{}'
        AND serialized::jsonb ? 'instrumentTracks'
        AND jsonb_typeof(serialized::jsonb->'instrumentTracks') = 'array'
    `);
  }

}

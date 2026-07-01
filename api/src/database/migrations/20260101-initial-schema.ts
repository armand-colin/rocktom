import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema implements MigrationInterface {
  name = 'InitialSchema1746480000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" text NOT NULL,
        "name" text NOT NULL,
        "email_validation_code" text,
        "email_validation_code_expires_at" TIMESTAMPTZ,
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
        CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "document" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "filename" text NOT NULL,
        "extension" text NOT NULL,
        "size" integer NOT NULL,
        "duration" integer,
        "user_id" uuid,
        CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "level" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "name" text NOT NULL,
        "serialized" text NOT NULL,
        "user_id" uuid NOT NULL,
        "playback_id" uuid,
        CONSTRAINT "PK_de6f58ecb76ff3af0f4d59635c9" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "session" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "refresh_token_hash" text NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "revoked_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "document"
      ADD CONSTRAINT "FK_f799a4f72f499f66c8d5a6c8d97"
      FOREIGN KEY ("user_id") REFERENCES "user"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "level"
      ADD CONSTRAINT "FK_2362e12f03f76adf4f6e2fef2a1"
      FOREIGN KEY ("user_id") REFERENCES "user"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "level"
      ADD CONSTRAINT "FK_6493ad57b3ec4a751ebd5c8fdd4"
      FOREIGN KEY ("playback_id") REFERENCES "document"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "session"
      ADD CONSTRAINT "FK_56540d9cf679b3e4998a81fbd4b"
      FOREIGN KEY ("user_id") REFERENCES "user"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "session" DROP CONSTRAINT "FK_56540d9cf679b3e4998a81fbd4b"');
    await queryRunner.query('ALTER TABLE "level" DROP CONSTRAINT "FK_6493ad57b3ec4a751ebd5c8fdd4"');
    await queryRunner.query('ALTER TABLE "level" DROP CONSTRAINT "FK_2362e12f03f76adf4f6e2fef2a1"');
    await queryRunner.query('ALTER TABLE "document" DROP CONSTRAINT "FK_f799a4f72f499f66c8d5a6c8d97"');
    await queryRunner.query('DROP TABLE "session"');
    await queryRunner.query('DROP TABLE "level"');
    await queryRunner.query('DROP TABLE "document"');
    await queryRunner.query('DROP TABLE "user"');
  }
}

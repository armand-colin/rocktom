import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLevelShare implements MigrationInterface {

  name = 'AddLevelShare1756970000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "level_share" (
        "level_id" uuid NOT NULL,
        "token" text NOT NULL,
        "permission" text NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_level_share" PRIMARY KEY ("level_id"),
        CONSTRAINT "UQ_level_share_token" UNIQUE ("token"),
        CONSTRAINT "FK_level_share_level"
          FOREIGN KEY ("level_id") REFERENCES "level"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "level_access" (
        "level_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "accepted_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_level_access" PRIMARY KEY ("level_id", "user_id"),
        CONSTRAINT "FK_level_access_level"
          FOREIGN KEY ("level_id") REFERENCES "level"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_level_access_user"
          FOREIGN KEY ("user_id") REFERENCES "user"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "level_access"`);
    await queryRunner.query(`DROP TABLE "level_share"`);
  }

}

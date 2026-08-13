import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeImageAdIdNullable1704000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing NOT NULL foreign key constraint and alter the column to be nullable
    await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT IF EXISTS "FK_images_adId"`);
    await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "adId" DROP NOT NULL`);

    // Re-add the foreign key without NOT NULL enforcement (nullable FK)
    await queryRunner.query(`
      ALTER TABLE "images"
      ADD CONSTRAINT "FK_images_adId"
      FOREIGN KEY ("adId") REFERENCES "ads"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT IF EXISTS "FK_images_adId"`);
    await queryRunner.query(`ALTER TABLE "images" ALTER COLUMN "adId" SET NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "images"
      ADD CONSTRAINT "FK_images_adId"
      FOREIGN KEY ("adId") REFERENCES "ads"("id") ON DELETE CASCADE
    `);
  }
}

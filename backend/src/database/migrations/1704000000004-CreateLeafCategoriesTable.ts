import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateLeafCategoriesTable1704000000004
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'leaf_categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'subCategoryId',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint to sub_categories
    await queryRunner.createForeignKey(
      'leaf_categories',
      new TableForeignKey({
        columnNames: ['subCategoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sub_categories',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('leaf_categories');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('subCategoryId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('leaf_categories', foreignKey);
      }
    }
    await queryRunner.dropTable('leaf_categories');
  }
}

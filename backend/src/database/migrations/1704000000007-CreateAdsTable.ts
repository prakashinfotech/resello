import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateAdsTable1704000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ads',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'categoryId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'cityId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'areaId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'views',
            type: 'integer',
            default: 0,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'ads',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'ads',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'leaf_categories',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'ads',
      new TableForeignKey({
        columnNames: ['cityId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'cities',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'ads',
      new TableForeignKey({
        columnNames: ['areaId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'areas',
        onDelete: 'RESTRICT',
      }),
    );

    // Add indexes for frequently queried columns
    await queryRunner.createIndex(
      'ads',
      new TableIndex({
        name: 'IDX_ADS_CATEGORY',
        columnNames: ['categoryId'],
      }),
    );

    await queryRunner.createIndex(
      'ads',
      new TableIndex({
        name: 'IDX_ADS_CITY',
        columnNames: ['cityId'],
      }),
    );

    await queryRunner.createIndex(
      'ads',
      new TableIndex({
        name: 'IDX_ADS_AREA',
        columnNames: ['areaId'],
      }),
    );

    await queryRunner.createIndex(
      'ads',
      new TableIndex({
        name: 'IDX_ADS_IS_ACTIVE',
        columnNames: ['isActive'],
      }),
    );

    await queryRunner.createIndex(
      'ads',
      new TableIndex({
        name: 'IDX_ADS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('ads', 'IDX_ADS_CREATED_AT');
    await queryRunner.dropIndex('ads', 'IDX_ADS_IS_ACTIVE');
    await queryRunner.dropIndex('ads', 'IDX_ADS_AREA');
    await queryRunner.dropIndex('ads', 'IDX_ADS_CITY');
    await queryRunner.dropIndex('ads', 'IDX_ADS_CATEGORY');

    // Drop foreign keys
    const table = await queryRunner.getTable('ads');
    if (table) {
      const foreignKeys = table.foreignKeys;

      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('ads', foreignKey);
      }
    }

    // Drop table
    await queryRunner.dropTable('ads');
  }
}

import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'grants'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()

      table.string('state').notNullable()
      table.specificType('startMethod', 'text[]').notNullable()
  
      table.string('continue_token').unique()
      table.string('continue_id').unique()
      table.integer('wait')
  
      table.string('finish_method').notNullable()
      table.string('finish_uri').notNullable()
      table.string('client_nonce').notNullable()
      table.string('client_key_id').notNullable()
  
      table.string('interact_id').notNullable().unique()
      table.string('interact_ref').notNullable().unique()
      table.string('interact_nonce').notNullable().unique()
  
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'grants'

  // TODO - Unique checks on compound columns like (continue_id, continue_token)

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()
      table.uuid('client_id').references('id').inTable('clients').onDelete('CASCADE')

      table.string('state').notNullable()
      table.specificType('start_method', 'text[]').notNullable()
  
      table.string('continue_id').unique()
      table.string('continue_token')
      table.integer('wait')
  
      table.string('finish_method').notNullable()
      table.string('finish_uri').notNullable()

      table.string('client_nonce').notNullable()
  
      table.string('interact_id').notNullable().unique()
      table.string('interact_ref').notNullable()
      table.string('interact_nonce').notNullable()
  
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

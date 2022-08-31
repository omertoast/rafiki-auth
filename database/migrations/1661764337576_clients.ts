import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ClientsSchema extends BaseSchema {
  protected tableName = 'clients'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      
      table.uuid('id').notNullable().primary()

      table.string('url').notNullable().unique()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

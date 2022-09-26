import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'keys'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      // TODO - Unique constraint (and index?) on (client_id, kid)

      table.uuid('id').notNullable().primary()
      table.uuid('client_id').references('id').inTable('clients').onDelete('CASCADE')

      table.string('kid').notNullable()
      table.json('jwk').notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

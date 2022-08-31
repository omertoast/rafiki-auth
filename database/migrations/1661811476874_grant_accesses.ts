import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'grant_accesses'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()
      table.uuid('grant_id').references('id').inTable('grants').onDelete('CASCADE')
      
      table.string('type').notNullable()
      table.specificType('actions', 'text[]').notNullable()
      table.string('identifier')
      table.specificType('locations', 'text[]')
      table.integer('interval')
      table.jsonb('limits')

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

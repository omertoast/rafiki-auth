import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'grants'

  // TODO - Enable this for postgres?

  // public async up () {
  //   this.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  // }
  
  // public down() {
  //   this.schema.raw('DROP EXTENSION IF EXISTS "uuid-ossp"')
  // }
}

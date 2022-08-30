import Grant from '../../app/Models/Grant'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Grant, ({ faker }) => {
  return {
    id: faker.datatype.uuid(),
  }
}).build()

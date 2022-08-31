import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import { column, BaseModel, beforeCreate, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Key from './Key'
import Grant from './Grant'

export default class Client extends BaseModel {
  
  public static selfAssignPrimaryKey = true

  @beforeCreate()
  public static assignUuid(client: Client) {
    client.id = uuid()
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public url: string

// Relations

  @hasMany(() => Key)
  public keys: HasMany<typeof Key>

  @hasMany(() => Grant)
  public grants: HasMany<typeof Grant>

  // Timestamps

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

}

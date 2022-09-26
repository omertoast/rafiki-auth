import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'

export default class Key extends BaseModel {
  public static selfAssignPrimaryKey = true

  @beforeCreate()
  public static assignUuid(key: Key) {
    key.id = uuid()
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public kid: string

  @column()
  public jwk: string

  // Relations

  @column()
  public clientId: string

  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>

  // Timestamps

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

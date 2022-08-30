import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
import Grant from './Grant'

export default class AccessToken extends BaseModel {
  @beforeCreate()
  public static assignUuid(grant: Grant) {
    grant.id = uuid()
  }
  @belongsTo(() => Grant, { foreignKey: 'grant_id', localKey: 'id'})
  public grant: BelongsTo<typeof Grant>

  @column({ isPrimary: true })
  public id: string

  @column() // Not Nullable - Unique
  public value: string

  @column() // Not Nullable - Unique - UUID
  public managementId: string

  @column() // Not Nullable
  public expiresIn: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

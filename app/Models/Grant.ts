import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, hasMany, HasMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import GrantAccess from './GrantAccess'
import AccessToken from './AccessToken'
import Client from './Client'

export default class Grant extends BaseModel {

  public static selfAssignPrimaryKey = true

  @beforeCreate()
  public static assignUuid(grant: Grant) {
    grant.id = uuid()
  }

  @column({ isPrimary: true })
  public id: string

  @column() // Not Nullable
  public state: GrantState

  @column() // Not Nullable - SpecificType text[]
  public startMethod: StartMethod[]

  @column() // Not Nullable - Unique
  public continueToken: string

  @column() // Not Nullable - Unique
  public continueId: string

  @column()
  public wait: number

  @column() // Not Nullable
  public finishMethod: FinishMethod

  @column() // Not Nullable
  public finishUri: string

  @column() // Not Nullable
  public clientNonce: string

  @column() // Not Nullable - Unique
  public interactId: string

  @column() // Not Nullable - Unique
  public interactRef: string

  @column() // Not Nullable - Unique
  public interactNonce: string


  // Relations

  @column()
  public clientId: string

  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>
  
  @hasMany(() => GrantAccess, {
    serializeAs: 'access'
  })
  public accesses: HasMany<typeof GrantAccess>

  @hasMany(() => AccessToken, {
    serializeAs: null
  })
  public accessTokens: HasMany<typeof AccessToken>

  // Timestamps

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

export enum StartMethod {
  Redirect = 'redirect'
}

export enum FinishMethod {
  Redirect = 'redirect'
}

export enum GrantState {
  Pending = 'pending',
  Granted = 'granted',
  Revoked = 'revoked',
  Rejected = 'rejected'
}
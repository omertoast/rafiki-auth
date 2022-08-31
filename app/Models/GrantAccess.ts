import { v4 as uuid } from 'uuid'
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, beforeCreate } from '@ioc:Adonis/Lucid/Orm'
import Grant from './Grant'

export default class GrantAccess extends BaseModel {

  public static selfAssignPrimaryKey = true

  @beforeCreate()
  public static assignUuid(grantAccess: GrantAccess) {
    grantAccess.id = uuid()
  }

  @column({ isPrimary: true })
  public id: string

  @column() // Not Nullable
  public type: AccessType

  @column() // Not Nullable
  public actions: Action[]

  @column()
  public identifier: string

  @column() // Not Nullable
  public locations: string[]

  @column()
  public interval: number

  @column() // Jsonb
  public limits: any

  // Relations

  @column()
  public grantId: string

  @belongsTo(() => Grant)
  public grant: BelongsTo<typeof Grant>

  // Timestamps

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

export enum AccessType {
  Account = 'account',
  IncomingPayment = 'incoming-payment',
  OutgoingPayment = 'outgoing-payment',
  Quote = 'quote'
}

export enum Action {
  Create = 'create',
  Read = 'read',
  List = 'list',
  Complete = 'complete'
}

interface BaseAccessRequest {
  actions: Action[]
  locations?: string[]
  identifier?: string
  interval?: string
}

interface IncomingPaymentRequest extends BaseAccessRequest {
  type: AccessType.IncomingPayment
  limits?: never
}

interface OutgoingPaymentRequest extends BaseAccessRequest {
  type: AccessType.OutgoingPayment
  limits?: OutgoingPaymentLimit
}

interface AccountRequest extends BaseAccessRequest {
  type: AccessType.Account
  limits?: never
}

interface QuoteRequest extends BaseAccessRequest {
  type: AccessType.Quote
  limits?: never
}

export type AccessRequest =
  | IncomingPaymentRequest
  | OutgoingPaymentRequest
  | AccountRequest
  | QuoteRequest

export function isAccessType(accessType: AccessType): accessType is AccessType {
  return Object.values(AccessType).includes(accessType)
}

export function isAction(actions: Action[]): actions is Action[] {
  if (typeof actions !== 'object') return false
  for (const action of actions) {
    if (!Object.values(Action).includes(action)) return false
  }

  return true
}

function isIncomingPaymentAccessRequest(
  accessRequest: AccessRequest
): accessRequest is IncomingPaymentRequest {
  return (
    accessRequest.type === AccessType.IncomingPayment &&
    isAction(accessRequest.actions) &&
    !accessRequest.limits
  )
}

function isOutgoingPaymentAccessRequest(
  accessRequest: AccessRequest
): accessRequest is OutgoingPaymentRequest {
  return (
    accessRequest.type === AccessType.OutgoingPayment &&
    isAction(accessRequest.actions) &&
    (!accessRequest.limits || isOutgoingPaymentLimit(accessRequest.limits))
  )
}

function isAccountAccessRequest(
  accessRequest: AccessRequest
): accessRequest is AccountRequest {
  return (
    accessRequest.type === AccessType.Account &&
    isAction(accessRequest.actions) &&
    !accessRequest.limits
  )
}

function isQuoteAccessRequest(
  accessRequest: AccessRequest
): accessRequest is QuoteRequest {
  return (
    accessRequest.type === AccessType.Quote &&
    isAction(accessRequest.actions) &&
    !accessRequest.limits
  )
}

export function isAccessRequest(
  accessRequest: any
): accessRequest is AccessRequest {
  return (
    isIncomingPaymentAccessRequest(accessRequest as AccessRequest) ||
    isOutgoingPaymentAccessRequest(accessRequest as AccessRequest) ||
    isAccountAccessRequest(accessRequest as AccessRequest) ||
    isQuoteAccessRequest(accessRequest as AccessRequest)
  )
}

// value should hold bigint, serialized as string for requests
// & storage as jsonb (postgresql.org/docs/current/datatype-json.html) field in postgres
export interface PaymentAmount {
  value: string
  assetCode: string
  assetScale: number
}

export type OutgoingPaymentLimit = {
  receiver: string
  sendAmount?: PaymentAmount
  receiveAmount?: PaymentAmount
}

export type LimitData = OutgoingPaymentLimit

function isPaymentAmount(
  paymentAmount: any | undefined
): paymentAmount is PaymentAmount {
  return (
    paymentAmount?.value !== undefined &&
    paymentAmount?.assetCode !== undefined &&
    paymentAmount?.assetScale !== undefined
  )
}

export function isOutgoingPaymentLimit(
  limit: any
): limit is OutgoingPaymentLimit {
  return (
    typeof limit?.receiver === 'string' &&
    isPaymentAmount(limit?.sendAmount) &&
    isPaymentAmount(limit?.receiveAmount)
  )
}
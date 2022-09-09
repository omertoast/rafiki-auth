import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import * as crypto from 'crypto'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import { v4 } from 'uuid'
import Grant, { FinishMethod, GrantState, StartMethod } from '../../../Models/Grant'

// GnapController sits behind the '/gnap' route to handle the implementation of the GNAP protocol
export default class GnapController {
  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-requesting-access
  public async requestGrant({ request }: HttpContextContract) {
    const grantSchema = schema.create({
      access_token: schema.object().anyMembers(),
      client: schema.object().members({
        display: schema.object().members({
          name: schema.string(),
          uri: schema.string(),
        }),
        key: schema.object().members({
          proof: schema.string(),
          jwk: schema.object().anyMembers(),
        }),
      }),
      interact: schema.object().members({
        start: schema.enumSet([StartMethod.Redirect] as const),
        finish: schema.object.nullableAndOptional().members({
          method: schema.enum([FinishMethod.Redirect] as const),
          uri: schema.string(),
          nonce: schema.string(),
        }),
      }),
    })

    const payload = await request.validate({ schema: grantSchema })

    const trx = await Database.transaction()
    try {
      const grant = await Grant.create(
        {
          state: GrantState.Pending,
          startMethod: payload.interact.start,
          finishMethod: payload.interact.finish?.method,
          finishUri: payload.interact.finish?.uri,
          clientNonce: payload.interact.finish?.nonce,
          interactId: v4(),
          interactRef: v4(),
          interactNonce: crypto.randomBytes(8).toString('hex').toUpperCase(), // TODO: factor out nonce generation
          continueId: v4(),
          continueToken: crypto.randomBytes(8).toString('hex').toUpperCase(),
        },
        trx
      )

      
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-continuing-a-grant-request
  public async continueGrant({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-modifying-an-existing-reque
  public async updateGrant({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-revoking-a-grant-request
  public async revokeGrant({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-rotating-the-access-token
  public async rotateToken({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-revoking-the-access-token
  public async revokeToken({}: HttpContextContract) {}
}

// const baseAccessRequestSchema = schema.create({
//       actions: schema.array().members(schema.enumSet(['read', 'list', 'create', 'complete'])),
//       locations: schema.array.nullableAndOptional().members(schema.string()),
//       identifier: schema.string.nullableAndOptional(),
//       interval: schema.string.nullableAndOptional(),
//     })

//     const incomingPaymentRequestSchema = schema.create({
//       type: schema.enumSet(['incoming-payment']),
//     })

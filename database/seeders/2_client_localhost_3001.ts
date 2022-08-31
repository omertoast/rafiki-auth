import { v4 as uuid } from 'uuid'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Client from '../../app/Models/Client'
import { FinishMethod, GrantState, StartMethod } from '../../app/Models/Grant'
import { AccessType, Action } from '../../app/Models/GrantAccess'

export default class extends BaseSeeder {

  public static developmentOnly = true

  public async run() {
    const client = await Client.create({
      url: 'https://localhost:3001/'
    })

    const grants = await client.related('grants').createMany([{
      state: GrantState.Granted,
      startMethod: [StartMethod.Redirect],
      finishMethod: FinishMethod.Redirect,
      finishUri: 'https://example.com/finish',
      clientNonce: 'example-client-nonce',
      interactId: uuid(),
      interactRef: 'example-interact-ref',
      interactNonce: 'example-interact-nonce',
      continueToken: 'CONTINUE-1',
      continueId: uuid()
    }, {
      state: GrantState.Granted,
      startMethod: [StartMethod.Redirect],
      finishMethod: FinishMethod.Redirect,
      finishUri: 'http://peer-auth:3006/finish',
      clientNonce: 'example-client-nonce',
      interactId: uuid(),
      interactRef: 'local-bank-interact-ref',
      interactNonce: 'local-bank-interact-nonce',
      continueToken: 'CONTINUE-2',
      continueId: uuid()
    }])

    grants[0].related('accesses').createMany([{
      type: AccessType.IncomingPayment,
      actions: [Action.Create, Action.Read, Action.List],
    },
    {
      type: AccessType.OutgoingPayment,
      actions: [Action.Create, Action.Read, Action.List],
    },
    {
      type: AccessType.Quote,
      actions: [Action.Create, Action.Read],
    }])

    grants[1].related('accesses').createMany([{
      type: AccessType.IncomingPayment,
      actions: [Action.Create, Action.Read, Action.List],
    },
    {
      type: AccessType.OutgoingPayment,
      actions: [Action.Create, Action.Read, Action.List],
    },
    {
      type: AccessType.Quote,
      actions: [Action.Create, Action.Read],
    }])

    grants[0].related('accessTokens').create({
      value: 'ACCESS-TOKEN-3',
      managementId: uuid(),
      expiresIn: 100000000,
    })

    grants[1].related('accessTokens').create({
      value: 'ACCESS-TOKEN-4',
      managementId: uuid(),
      expiresIn: 100000000,
    })

    await client.related('keys').createMany([{
      kid: 'key-1',
      jwk: '{}'
    }, {
      kid: 'key-2',
      jwk: '{}'
    }])

  }
}

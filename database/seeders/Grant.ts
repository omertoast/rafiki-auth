import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { DateTime } from 'luxon'
import Grant, { FinishMethod, GrantState, StartMethod } from '../../app/Models/Grant'

export default class extends BaseSeeder {
  public async run () {
    await Grant.createMany([
      {
        id: '051208da-f6b6-4ed0-b49b-8b00439003bc',
        state: GrantState.Granted,
        startMethod: [StartMethod.Redirect],
        finishMethod: FinishMethod.Redirect,
        finishUri: 'https://example.com/finish',
        clientNonce: 'example-client-nonce',
        clientKeyId: 'http://fynbos/keys/1234',
        interactId: 'example-interact-id',
        interactRef: 'exmaple-interact-ref',
        interactNonce: 'example-interact-nonce',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now()
      },
      {
        id: '3afc74b3-ea28-4d7d-a21a-97742c40cdee',
        state: GrantState.Granted,
        startMethod: [StartMethod.Redirect],
        finishMethod: FinishMethod.Redirect,
        finishUri: 'http://peer-auth:3006/finish',
        clientNonce: 'example-client-nonce',
        clientKeyId: 'http://local-bank/keys/1234',
        interactId: 'local-bank-interact-id',
        interactRef: 'local-bank-interact-ref',
        interactNonce: 'local-bank-interact-nonce',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now()
      }
    ])
  }
}

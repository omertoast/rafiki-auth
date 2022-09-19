import { test } from '@japa/runner'
import { v4 } from 'uuid'
import { FinishMethod, StartMethod } from '../../../app/Models/Grant'
import { AccessType, Action } from '../../../app/Models/GrantAccess'
import * as crypto from 'crypto'

export const TEST_CLIENT_DISPLAY = {
  name: 'Test Client',
  uri: 'https://example.com'
}

export const KEY_REGISTRY_ORIGIN = 'https://openpayments.network'
export const KID_PATH = '/keys/base-test-key'

export const TEST_CLIENT_KEY = {
  proof: 'httpsig',
  jwk: {
    kid: KEY_REGISTRY_ORIGIN + KID_PATH,
    x: 'hin88zzQxp79OOqIFNCME26wMiz0yqjzgkcBe0MW8pE',
    kty: 'OKP',
    alg: 'EdDSA',
    crv: 'Ed25519',
    key_ops: ['sign', 'verify'],
    use: 'sig'
  }
}

const BASE_GRANT_REQUEST = {
  access_token: {
    access: [
      {
        type: AccessType.IncomingPayment,
        actions: [Action.Create, Action.Read, Action.List],
        locations: ['https://example.com'],
        identifier: `https://example.com/${v4()}`
      }
    ]
  },
  client: {
    display: TEST_CLIENT_DISPLAY,
    key: TEST_CLIENT_KEY
  },
  interact: {
    start: [StartMethod.Redirect],
    finish: {
      method: FinishMethod.Redirect,
      uri: 'https://example.com/finish',
      nonce: crypto.randomBytes(8).toString('hex').toUpperCase()
    }
  }
}

test('request grant', async ({ client }) => {
  const response = await client.post('/gnap',).headers({
    'Content-Type': 'application/json',
    'Accepts': 'application/json'
  }).json({
  })

  console.log(response.body())

  response.assertStatus(200)
})

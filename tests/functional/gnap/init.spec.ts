import { test } from '@japa/runner'

test('request grant', async ({ client }) => {
  const response = await client.post('/gnap',).headers({
    'Signature': 'sig1=:iuwefiwuef:',
    'Signature-Input': 'sig1=(@method @target-uri content-digest);created=0;keyid=test;8weryyewr'
  }).json({
    client: 'https://localhost:3000'
  })
  response.assertStatus(200)
  // response.assertBodyContains({ hello: 'world' })
})

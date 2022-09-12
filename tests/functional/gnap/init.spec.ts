import { test } from '@japa/runner'

test('request grant', async ({ client }) => {
  const response = await client.post('/gnap',).headers({
    'Content-Digest' : 'sha-256=:47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=:',
    'Signature': 'sig1=:iuwefiwuef:',
    'Signature-Input': 'sig1=("@method" "@target-uri" "content-digest");created=0;keyid="key-1"'
  }).json({
    client: 'https://localhost:3000'
  })
  response.assertStatus(200)
  // response.assertBodyContains({ hello: 'world' })
})

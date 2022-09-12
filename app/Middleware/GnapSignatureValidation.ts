import { Exception } from '@adonisjs/core/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Config from '@ioc:Adonis/Core/Config'

import { httpis, RequestLike, verifyContentDigest } from 'http-message-signatures'
import { verify, KeyLike } from 'crypto'
import { importJWK, JWK } from 'jose'

export type GnapSignatureValidationConfig = {

}

// Verify the signature on a request
export default class GnapSignatureValidation {
    public async handle(ctx: HttpContextContract, next: () => Promise<void>, configuration: string = 'default') {

        const config = Config.get(`gnap.middleware.signature.${configuration}`) as GnapSignatureValidationConfig
        if (!config) {
            // TODO - Setup Config for middleware
        }


        const { client, request } = ctx

        if (!client) {
            throw new Exception("Unknown client. Unable to verify signature.")
        }

        const signatures = httpis.parseSignatures(requestLike(ctx))

        // Ensure the signature uses the required components
        // https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol#section-7.3.1
        const requiredComponents = [
            '@method',
            '@target-uri',
        ]
        if (request.hasBody()) {
            requiredComponents.push('content-digest')

            // Verify the content digest
            verifyContentDigest(requestLike(ctx))
        }
        if (request.header('authorization')) {
            requiredComponents.push('authorization')
        }


        // Loop through all signatures on the request and verify them
        // TODO - We might want to change this logic to only require one match against the client which is verified
        const verifications: Promise<boolean>[] = []
        signatures.forEach((signature, signatureName) => {

            const { components } = signature
            if (!components || components.length === 0) {
                throw new Error(`No components in signature input parsed for signature '${signatureName}'`)
            }

            requiredComponents.forEach((required) => {
                if (!components.includes(required)) {
                    throw new Error(`The signature input is missing the required component '${required}'`)
                }
            })

            const { value, keyid, alg, signatureParams } = signature

            if (!keyid) {
                throw new Error(`The signature input is missing the 'keyid' parameter`)
            }

            if (alg && alg !== 'ed25519') {
                throw new Error(`The signature parameter 'alg' is using an illegal value '${alg}'. Only 'ed25519' is supported.`)
            }

            const clientKey = client.keys.find(key => (key.kid == keyid))
            if (!clientKey) {
                // TODO - Go and fetch the latest client keys, maybe this is a new one
                throw new Error(`The kid '${keyid}' is not a valid key id for the current client`)
            }

            // TODO - Load public key from JWK
            const data = Buffer.from(httpis.buildSignedData(requestLike(ctx), components!, signatureParams))

            verifications.push(new Promise<boolean>((resolve, reject) => {
                importJWK(JSON.parse(clientKey.jwk) as JWK).then((key) => {

                    // TODO - resolve typing issue with key
                    // verify(undefined, data, key, value, (error, result) => {
                    //     if (error) {
                    //         reject(error)
                    //         return
                    //     }
                    //     resolve(result)
                    // })
                }).catch(reject)
            }))
        })
        const result = (await Promise.all(verifications)).every(result => result)

        if (!result) {
            throw new Error("Unable to verify request signature")
        }

        await next()
    }
}

// Creates a RequestLike object for the http-message-signatures library input
function requestLike({ request }: HttpContextContract): RequestLike {
    return {
        method: request.method(),
        headers: request.headers(),
        url: request.completeUrl(),
        body: request.raw() || undefined
    }
}

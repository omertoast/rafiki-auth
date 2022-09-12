import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class JsonOnly {
    public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {

        const REQUIRED = 'application/json'
        const contentType = request.header('content-type')
        const accepts = request.header('accepts')

        response.abortUnless(
            contentType === REQUIRED && accepts === REQUIRED,
            { error: 'invalid_request' }, 406)

        await next()
    }
}

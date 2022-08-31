import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class IdentifyGnapClient {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {

    const token = IdentifyGnapClient.getGnapToken(ctx)
    if (token) {
      // Look up grant by continue token and id
      // const client = await this.getClientFromContinueId(continueId, token)
    } else {
      // This is a new request so we need to extract the client identifier from the request body
      // const client = await this.getClientFromGrantRequest(this.ctx.request.body())
    }

    // ctx.client = client

    await next()
  }

  /**
 * Returns the GNAP token rom the Authorization header
 */
  private static getGnapToken({ request }: HttpContextContract): string | undefined {
    /**
     * Ensure the "Authorization" header value exists
     */
    const token = request.header('Authorization')
    if (!token) {
      return
    }

    /**
     * Ensure that token has minimum of two parts and the first
     * part is a constant string named `bearer`
     */
    const [type, value] = token.split(' ')
    if (!type || type.toLowerCase() !== 'gnap' || !value) {
      return
    }
    return value
  }
}

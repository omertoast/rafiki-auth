import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Token from '@ioc:Rafiki/Auth/Token'
import RequestValidator from '@ioc:Rafiki/Auth/RequestValidator'

// TokenController sits behind the '/gnap' route to handle the implementation of the GNAP protocol
export default class TokenController {
  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-rotating-the-access-token
  public async rotateToken(ctx: HttpContextContract) {
    await RequestValidator.validateRequest(ctx)

    const newToken = await Token.rotate(ctx.params.id)

    return ctx.response.ok({ token: newToken })
  }

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-revoking-the-access-token
  public async revokeToken(ctx: HttpContextContract) {
    await RequestValidator.validateRequest(ctx)

    return ctx.response.status(200)
  }
}

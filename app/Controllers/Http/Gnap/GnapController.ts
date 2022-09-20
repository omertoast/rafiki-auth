import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RequestValidator from '@ioc:Rafiki/Auth/RequestValidator';
import { paths } from 'App/Services/requestValidator/spec/auth-open-payments-schema';

// GnapController sits behind the '/gnap' route to handle the implementation of the GNAP protocol
export default class GnapController {
  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-requesting-access
  public async requestGrant(ctx: HttpContextContract) {
    const body = await RequestValidator.validateRequest<RequestGrantBody>(ctx)
      .catch((errors) => {
        throw {
          errorCode: 'invalid_request',
          errors: errors
        }
      })

    return ctx.response.ok({body})
  }

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-continuing-a-grant-request
  public async continueGrant(ctx: HttpContextContract) {
    const body = await RequestValidator.validateRequest<ContinueGrantBody>(ctx)
      .catch((errors) => {
        throw {
          errorCode: 'invalid_request',
          errors: errors
        }
      })

    return ctx.response.ok({body})
  }

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-modifying-an-existing-reque
  public async updateGrant({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-revoking-a-grant-request
  public async revokeGrant({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-rotating-the-access-token
  public async rotateToken({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-revoking-the-access-token
  public async revokeToken({}: HttpContextContract) {}

}

type RequestGrantBody = paths['/']['post']['requestBody']['content']['application/json']
type ContinueGrantBody = paths['/continue/{id}']['post']['requestBody']['content']['application/json']

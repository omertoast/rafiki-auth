import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createOpenAPI, HttpMethod } from 'openapi'
import { operations } from '../../../../auth-open-payments-schema';
import { OpenAPI } from 'openapi-types';

// GnapController sits behind the '/gnap' route to handle the implementation of the GNAP protocol
export default class GnapController {

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-requesting-access
  public async requestGrant(ctx: HttpContextContract) {
    const payload = await validateGnapRequest<RequestGrantBody>(ctx)
      .catch(errors => ctx.response.badRequest(errors))

    return payload
  }

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-continuing-a-grant-request
  public async continueGrant({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-modifying-an-existing-reque
  public async updateGrant({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-revoking-a-grant-request
  public async revokeGrant({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-rotating-the-access-token
  public async rotateToken({}: HttpContextContract) {}

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-revoking-the-access-token
  public async revokeToken({}: HttpContextContract) {}

}

type RequestGrantBody = operations['post']['requestBody']['content']['application/json']

async function validateGnapRequest<T>(ctx: HttpContextContract): Promise<T> { 
  const spec = await createOpenAPI('./auth-open-payments-spec.yaml')
  const requestValidator = spec.createRequestValidator<OpenAPI.Request>({
    path: "/",
    method: HttpMethod.POST
  })

  const openAPIRequest: OpenAPI.Request = {
    headers: ctx.request.headers(),
    body: ctx.request.body(),
    params: ctx.request.params(),
    query: ctx.request.qs()
  }

  try {
    const isValid = requestValidator(openAPIRequest)
    return ctx.request.body() as T
  } catch (errors) {
    throw errors
  }
}

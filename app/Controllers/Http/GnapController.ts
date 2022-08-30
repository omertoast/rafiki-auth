import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

// GnapController sits behind the '/gnap' route to handle the implementation of the GNAP protocol
export default class GnapController {

  // https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-10.html#name-requesting-access
  public async requestGrant({}: HttpContextContract) {}

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

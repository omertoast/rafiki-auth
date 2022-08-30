import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'


// TokensController sits behind the '/tokens' route to handle admin functions on the access tokens
export default class TokensController {
  public async index({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

// TokensController sits behind the '/grants' route to handle admin functions on the grants
export default class GrantsController {
  public async index({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

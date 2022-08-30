import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

// InteractionsController sits behind the '/interactions' route to handle admin functions on the interactions
export default class InteractionsController {
  public async index({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}

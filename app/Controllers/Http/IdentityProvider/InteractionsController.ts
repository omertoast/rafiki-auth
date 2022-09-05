import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InteractionsController {
  public async start({}: HttpContextContract) {}

  public async finish({}: HttpContextContract) {}
}

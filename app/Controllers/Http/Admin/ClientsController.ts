import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from '../../../Models/Client'

// TODO - Consider using Route Model Binding : https://github.com/adonisjs/route-model-binding
export default class ClientsController {
  public async index({ response }: HttpContextContract) {
    const clients = await Client.all()
    response.ok(clients)
  }

  public async store({ request, response }: HttpContextContract) {
    const client = await Client.create(request.body())
    response.header('Location', `${request.completeUrl()}/${client.id}`)
    response.created(client)
  }

  public async show({ request, response }: HttpContextContract) {
    const client = await Client.find(request.param('id'))
    client ? response.ok(client) : response.notFound()
  }

  public async update({ request, response }: HttpContextContract) {

    const client = await Client.find(request.param('id'))
    if(!client) {
      response.notFound()
      return
    }
    client.merge(request.body())
    await client.save()
    response.accepted(client)
  }

  public async destroy({ request, response }: HttpContextContract) {
    const client = await Client.find(request.param('id'))
    if(!client) {
      response.notFound()
      return
    }
    client.merge(request.body())
    await client.delete()
    response.ok('')
  }
}

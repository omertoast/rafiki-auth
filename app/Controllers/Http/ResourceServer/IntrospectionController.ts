import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

// IntrospectionController sits behind the '/introspect' route to handle token introspection requests
export default class IntrospectionController {
  public async introspect({}: HttpContextContract) {}
}

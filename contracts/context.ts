import Client from '../app/Models/Client'

declare module '@ioc:Adonis/Core/HttpContext' {
  interface HttpContextContract {
    client: Client | null
  }
}

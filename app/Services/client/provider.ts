import { Exception } from '@adonisjs/core/build/standalone'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { ClientService } from './service'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async register() {
    const { NewService } = await import('./service')
    const clientService = await NewService()

    this.app.container.singleton('Rafiki/Auth/ClientService', () => {
      return clientService
    })
  }

  public async boot() {
    // All bindings are ready, feel free to use them
    const Route = this.app.container.use('Adonis/Core/Route')
    const ClientService: ClientService = this.app.container.use('Rafiki/Auth/ClientService')

    Route.Route.macro('checkHttpMessageSignature', function () {
      this.middleware(async (ctx, next) => {
        const { client, request } = ctx

        if (!client) {
          throw new Exception('Client not found', 404, 'E_NOT_FOUND')
        }

        ClientService.authenticateClientRequest(client, request)

        if (!client) {
          throw new Exception('Unknown client. Unable to verify signature.')
        }

        await next()
      })

      return this
    })

    Route.RouteGroup.macro('checkHttpMessageSignature', function () {
      this.middleware(async (ctx, next) => {
        if (!ctx.request.hasValidSignature()) {
          return ctx.response.badRequest('Invalid signature')
        }

        await next()
      })

      return this
    })
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}

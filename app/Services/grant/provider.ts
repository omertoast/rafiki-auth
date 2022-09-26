import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async register() {
    const { NewService } = await import('./service')
    const grantService = await NewService()
    this.app.container.singleton('Rafiki/Auth/GrantService', () => {
      return grantService
    })
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}

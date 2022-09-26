import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async register() {
		this.app.container.singleton('Rafiki/Auth/Token', async () => {
      const { NewService } = await import('./service')
      const tokenService = await NewService()

      return tokenService
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

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { NewService } from './service'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async register() {
    const Config = this.app.container.use('Adonis/Core/Config')

    const clientService = await NewService()
		this.app.container.singleton('Rafiki/Auth/Client', () => {
			return clientService
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

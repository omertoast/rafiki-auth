import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { NewService } from './service'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
		this.app.container.singleton('Rafiki/Auth/RequestValidator', () => {
			return NewService()
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

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { NewService } from './service'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public async register() {
		const RequestValidator = await NewService({
			specPath: './app/Services/requestValidator/spec/auth-open-payments-spec.yaml',
		})

		this.app.container.singleton('Rafiki/Auth/RequestValidator', () => {
			return RequestValidator
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

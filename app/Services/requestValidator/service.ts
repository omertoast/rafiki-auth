import { createOpenAPI } from "openapi"

export interface RequestValidatorService {
	sayHello: (name: string) => string
}

export const NewService = (): RequestValidatorService => {
	const spec = createOpenAPI('./app/Services/requestValidator/spec/auth-open-payments-spec.yaml')

	return {
		sayHello: (name: string) => `Hello ${name}`
	}
}
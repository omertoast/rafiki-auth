import { createOpenAPI, OpenAPI, HttpMethod, ValidateFunction } from "openapi"
import * as openapiTypes from 'openapi-types';
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"

interface ServiceDependencies {
	spec: OpenAPI,
	requestValidators: Map<PathMethod, ValidateFunction<openapiTypes.OpenAPI.Request>>
}

interface ServiceArgs {
	specPath: string,
}

interface PathMethod {
	path: string
	method: string
}

export interface RequestValidatorService {
	requestValidator: <T>(ctx: HttpContextContract) => Promise<T>
}

// TODO:
// - automate static type checking
// - figure out using the validator once and pass the parsed value between middlewares and controllers
export const NewService = async (args: ServiceArgs): Promise<RequestValidatorService> => {
	const spec = await createOpenAPI(args.specPath)

	const requestValidators = new Map<PathMethod, ValidateFunction<openapiTypes.OpenAPI.Request>>()

	Object.keys(spec.paths).forEach((path) => {
		Object.keys(spec.paths[path]).forEach((method) => {
			if (method === 'parameters') return
			requestValidators.set({
				path,
				method: method.toUpperCase()
			}, spec.createRequestValidator<openapiTypes.OpenAPI.Request>({
				path,
				method: method as HttpMethod
			}))
		})
	})

	const deps: ServiceDependencies = {
		spec,
		requestValidators
	}

	return {
		requestValidator: <T>(ctx: HttpContextContract) => requestValidator<T>(deps, ctx)
	}
}

const requestValidator = async <T>(deps: ServiceDependencies, ctx: HttpContextContract): Promise<T> => {
	const { request, route } = ctx
	const path = routeToPath(route?.pattern || '')

	const requestValidator = deps.requestValidators.get({
		path: path,
		method: request.method()
	})

	if (!requestValidator) {
		throw new Error('no request validator found')
	}

	const openAPIRequest: openapiTypes.OpenAPI.Request = {
		headers: request.headers(),
		body: request.body(),
		params: request.params(),
		query: request.qs()
	}

	try {
		const isValid = requestValidator(openAPIRequest)
		if (!isValid) {
			throw new Error('invalid request')
		}
		return request.body() as T
	} catch (errors) {
		throw errors
	}
}

// regex match replace ":id" with "{id}", ":nonce" with "{nonce}" etc
export const routeToPath = (route: string): string => {
	if (!route.startsWith('/gnap')) {
		throw new Error('route must start with /gnap')
	}

	const routeWithoutGnap = route.replace('/gnap', '')
	if (routeWithoutGnap === '') {
		return '/'
	}

	const regex = /:(\w+)/g
	const path = routeWithoutGnap.replace(regex, '{$1}')
	return path
}
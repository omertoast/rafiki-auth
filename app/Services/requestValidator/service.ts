import { createOpenAPI, OpenAPI, HttpMethod } from "openapi"
import * as openapiTypes from 'openapi-types';
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"

interface ServiceDependencies {
	spec: OpenAPI
}

interface ServiceArgs {
	specPath: string
}

export interface RequestValidatorService {
	requestValidator: <T>(ctx: HttpContextContract) => Promise<T>
}

export const NewService = async (args: ServiceArgs): Promise<RequestValidatorService> => {
	const spec = await createOpenAPI(args.specPath)
	const deps: ServiceDependencies = {
		spec
	}

	return {
		requestValidator: <T>(ctx: HttpContextContract) => requestValidator<T>(deps, ctx)
	}
}

const requestValidator = async <T>(deps: ServiceDependencies, ctx: HttpContextContract): Promise<T> => {
	const { request, route } = ctx
	const path = routeToPath(route?.pattern || '')

	const requestValidator = deps.spec.createRequestValidator<openapiTypes.OpenAPI.Request>({
		path: path,
		method: request.method().toLocaleLowerCase() as HttpMethod
	})

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
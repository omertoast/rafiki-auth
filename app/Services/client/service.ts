interface ServiceDependencies {

}

interface ServiceArgs {

}

export interface ClientService {
	sayHello: (name: string) => Promise<string>
}

export const NewService = async (): Promise<ClientService> => {
	return {
		sayHello: async (name: string) => {
			return `Hello ${name}`
		}
	}
}
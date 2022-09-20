interface ServiceDependencies {

}

interface ServiceArgs {

}

export interface GrantService {
	sayHello: (name: string) => Promise<string>
}

export const NewService = async (): Promise<GrantService> => {
	return {
		sayHello: async (name: string) => {
			return `Hello ${name}`
		}
	}
}
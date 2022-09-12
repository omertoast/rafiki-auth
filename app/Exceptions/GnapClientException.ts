import { Exception } from '@adonisjs/core/build/standalone'

export default class GnapClientException extends Exception {
    constructor(message: string, code: number = 400) {
        super(message, code, 'E_GNAP_CLIENT_EXCEPTION')
    }
}

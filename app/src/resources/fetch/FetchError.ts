import { StatusCode as GlobalStatusCode } from "./StatusCode"

export abstract class FetchError extends Error {

    constructor(message: string) {
        super(message)
    }

}

export namespace FetchError {

    export class StatusCode extends FetchError {

        constructor(readonly response: Response) {
            super(response.statusText)
        }

        get statusCode(): GlobalStatusCode {
            return this.response.status as GlobalStatusCode
        }

    }

    export class Network extends FetchError {

        constructor(readonly nativeError: Error) {
            super(nativeError.message)
        }

    }

    export class MissingToken extends FetchError {

        constructor() {
            super('No valid access token')
        }

    }


}
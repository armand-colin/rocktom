export class StatusCodeError extends Error {

    constructor(public response: Response) {
        super(response.statusText)
    }

}
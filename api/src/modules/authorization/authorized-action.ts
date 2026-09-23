import { ForbiddenException } from "@nestjs/common";
import { Result } from "@niloc/utils";

export type AuthorizedActionResult = Result<void, { message: string }>

export namespace AuthorizedActionResult {

    export function ok(): AuthorizedActionResult {
        return Result.ok(undefined)
    }

    export function error(message: string): AuthorizedActionResult {
        return Result.error({ message })
    }

}

export abstract class AuthorizedAction {

    protected abstract validate(): Promise<AuthorizedActionResult>

    async assert(): Promise<void> {
        const result = await this.validate()
        if (result.ok) {
            return
        }

        throw new ForbiddenException(result.error.message)
    }

}
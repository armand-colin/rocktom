import { ForbiddenException } from "@nestjs/common";
import { Result } from "@niloc/utils";

export abstract class AuthorizedAction {

    protected abstract validate(): Promise<Result<void, string>>

    async assert(): Promise<void> {
        const result = await this.validate()
        if (result.ok) {
            return
        }

        throw new ForbiddenException(result.error)
    }

}
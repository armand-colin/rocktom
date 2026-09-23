import { Repository } from "typeorm";
import { AuthorizedAction, AuthorizedActionResult } from "../authorized-action";
import { Level } from "../../level/level.entity";

export class LevelAuthorizedAction extends AuthorizedAction {

    constructor(
        protected readonly context: {
            levelRepository: Repository<Level>,
            userId: string,
            levelId: string,
            action: 'read' | 'write' | 'delete'
        }
    ) {
        super()
    }

    protected async validate(): Promise<AuthorizedActionResult> {
        return AuthorizedActionResult.error('Not implemented')
    }

}

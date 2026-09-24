import { Repository } from "typeorm";
import { AuthorizedAction, AuthorizedActionResult } from "../authorized-action";
import { Level } from "../../level/level.entity";

export class LevelAuthorizedActionFactory {

    constructor(private readonly levelRepository: Repository<Level>) {

    }

    private _action(opts: { levelId: string, userId: string }, action: 'write' | 'read' | 'delete'): LevelAuthorizedAction {
        return new LevelAuthorizedAction({
            levelRepository: this.levelRepository,
            userId: opts.userId,
            levelId: opts.levelId,
            action: action
        })
    }

    write(opts: { levelId: string, userId: string }): LevelAuthorizedAction {
        return this._action(opts, 'write')
    }

    read(opts: { levelId: string, userId: string }): LevelAuthorizedAction {
        return this._action(opts, 'read')
    }

    delete(opts: { levelId: string, userId: string }): LevelAuthorizedAction {
        return this._action(opts, 'delete')
    }

} 

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
        if (this.context.action === "delete") {
            const exists = await this.context.levelRepository.exists({
                where: {
                    id: this.context.levelId,
                    userId: this.context.userId,
                }
            })
            if (exists)
                return AuthorizedActionResult.ok()

            return AuthorizedActionResult.error('no access')
        }

        if (this.context.action === "write") {
            const exists = await this.context.levelRepository.exists({
                where: [
                    {
                        id: this.context.levelId,
                        userId: this.context.userId,
                    },
                    {
                        id: this.context.levelId,
                        share: {
                            enabled: true,
                            permission: 'write',
                        },
                        access: {
                            userId: this.context.userId,
                        }
                    }
                ]
            })

            if (exists)
                return AuthorizedActionResult.ok()

            return AuthorizedActionResult.error('no access')
        }

        if (this.context.action === "read") {
            const exists = await this.context.levelRepository.exists({
                where: [
                    {
                        id: this.context.levelId,
                        userId: this.context.userId,
                    },
                    {
                        id: this.context.levelId,
                        share: {
                            enabled: true,
                        },
                        access: {
                            userId: this.context.userId,
                        }
                    }
                ]
            })
            if (exists)
                return AuthorizedActionResult.ok()

            return AuthorizedActionResult.error('no access')
        }

        return AuthorizedActionResult.error('invalid action')
    }

}

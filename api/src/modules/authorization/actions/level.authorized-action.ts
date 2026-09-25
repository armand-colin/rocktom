import { Repository } from "typeorm";
import { AuthorizedAction, AuthorizedActionResult } from "../authorized-action";
import { Level } from "../../level/level.entity";
import { Enum } from "@niloc/utils";

const Role = Enum.create({
    Own: 'owner',
    Write: 'write',
    Read: 'read',
})

type Role = Enum.Infer<typeof Role>;

export class LevelAuthorizedActionFactory {

    constructor(private readonly levelRepository: Repository<Level>) {

    }

    private _action(opts: { levelId: string, userId: string }, role: Role): LevelAuthorizedAction {
        return new LevelAuthorizedAction({
            levelRepository: this.levelRepository,
            userId: opts.userId,
            levelId: opts.levelId,
            role: role
        })
    }

    write(opts: { levelId: string, userId: string }): LevelAuthorizedAction {
        return this._action(opts, Role.Write)
    }

    read(opts: { levelId: string, userId: string }): LevelAuthorizedAction {
        return this._action(opts, Role.Read)
    }

    delete(opts: { levelId: string, userId: string }): LevelAuthorizedAction {
        return this._action(opts, Role.Own)
    }

    share(opts: { levelId: string, userId: string }): LevelAuthorizedAction {
        return this._action(opts, Role.Own)
    }

} 

export class LevelAuthorizedAction extends AuthorizedAction {

    constructor(
        protected readonly context: {
            levelRepository: Repository<Level>,
            userId: string,
            levelId: string,
            role: Role
        }
    ) {
        super()
    }

    protected async validate(): Promise<AuthorizedActionResult> {
        if (this.context.role === Role.Own) {
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

        if (this.context.role === Role.Write) {
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

        if (this.context.role === Role.Read) {
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

import { Enum } from "@niloc/utils";
import { AuthorizedAction, AuthorizedActionResult } from "../authorized-action";
import { Repository } from "typeorm";
import { Document } from "../../document/document.entity";
import { Level } from "../../level/level.entity";

const Role = Enum.create({
    Own: 'own',
    Read: 'read',
})

type Role = Enum.Infer<typeof Role>

export class DocumentAuthorizedActionFactory {

    constructor(
        private readonly documentRepository: Repository<Document>,
    ) { }

    private _action(opts: { documentId: string, userId: string }, role: Role): DocumentAuthorizedAction {
        return new DocumentAuthorizedAction({
            documentId: opts.documentId,
            userId: opts.userId,
            repository: this.documentRepository,
            role: role
        })
    }

    delete(opts: { documentId: string, userId: string }): DocumentAuthorizedAction {
        return this._action(opts, 'own')
    }

    read(opts: { documentId: string, userId: string }): DocumentAuthorizedAction {
        return this._action(opts, 'read')
    }

}

class DocumentAuthorizedAction extends AuthorizedAction {

    constructor(public payload: {
        documentId: string,
        userId: string,
        repository: Repository<Document>,
        role: Role
    }) {
        super()
    }

    protected async validate(): Promise<AuthorizedActionResult> {
        const { documentId, userId, repository: documentRepository, role } = this.payload

        if (role === 'own') {
            const exists = await documentRepository.exists({
                where: {
                    id: documentId,
                    userId: userId
                }
            })

            if (!exists)
                return AuthorizedActionResult.error('not allowed')

            return AuthorizedActionResult.ok()
        }

        if (role === 'read') {
            const owns = await documentRepository.exists({
                where: [{
                    id: documentId,
                    userId: userId
                },
                {
                    id: documentId,
                    levels: {
                        share: {
                            enabled: true
                        },
                        access: {
                            userId: userId
                        }
                    }
                }]
            })

            if (owns)
                return AuthorizedActionResult.ok()

            return AuthorizedActionResult.error('not allowed')
        }

        return AuthorizedActionResult.error('role not allowed')
    }

}
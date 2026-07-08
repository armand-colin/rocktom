import { Engine, Resource } from "@niloc/ecs";
import type { PartialRecord } from "../utils/types";
import { DocumentQueries } from "../queries/document/DocumentQueries";
import { Result } from "@niloc/utils";

export class DocumentManager extends Resource {

    // TODO: add "lifetime" on files, to discard them after a certain time
    private _files: PartialRecord<string, ArrayBuffer> = {}
    private _fileRequests: PartialRecord<string, Promise<Result<ArrayBuffer, Error>>> = {}

    constructor(engine: Engine) {
        super(engine)
    }

    download(documentId: string): Promise<Result<ArrayBuffer, Error>> {
        if (this._files[documentId]) {
            return Promise.resolve(Result.ok(this._files[documentId]))
        }
        
        if (this._fileRequests[documentId]) {
            return this._fileRequests[documentId]
        }

        this._fileRequests[documentId] = DocumentQueries.download(documentId)
            .then(result => {
                if (result.ok) {
                    this._files[documentId] = result.value
                }

                return result
            })
            .finally(() => {
                delete this._fileRequests[documentId]
            })

        return this._fileRequests[documentId]
    }

}
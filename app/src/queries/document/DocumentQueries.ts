import { Result } from "@niloc/utils";
import { Instance } from "../../Instance";
import { Fetch } from "../../resources/fetch/Fetch";
import type { DocumentEntity } from "./DocumentEntity";
import { Body } from "../../resources/fetch/RestClient";

export namespace DocumentQueries {

    export function get(id: string): Promise<Result<DocumentEntity, Error>> {
        const fetch = Instance.engine.getResource(Fetch)
        return fetch.apiAuth.get<DocumentEntity>('/document/' + id)
    }

    export function getAll(): Promise<Result<DocumentEntity[], Error>> {
        const fetch = Instance.engine.getResource(Fetch)
        return fetch.apiAuth.get<DocumentEntity[]>('/document')
    }

    export function upload(file: File): Promise<Result<DocumentEntity, Error>> {
        const fetch = Instance.engine.getResource(Fetch)
        return fetch.apiAuth.post<DocumentEntity>('/document/upload', Body.multipart({ file: file }))
    }

    export function download(documentId: string): Promise<Result<ArrayBuffer, Error>> {
        const fetch = Instance.engine.getResource(Fetch)
        return fetch.apiAuth.get<ArrayBuffer>('/document/' + documentId + '/download')
    }

}
import { Instance } from "../../Instance";
import type { DocumentEntity } from "./DocumentEntity";
import type { Body } from "../../resources/queryClient/Body";

export namespace DocumentQueries {

    export const get = Instance.queryClient.get('/document/:id')
        .result<DocumentEntity>()
        .build()

    export const getAll = Instance.queryClient.get('/document')
        .result<DocumentEntity[]>()
        .build()

    export const upload = Instance.queryClient.post('/document/upload')
        .result<DocumentEntity>()
        .body<Body.Multipart<{ file: File }>>()
        .build()

    export const download = Instance.queryClient.get('/document/:id/download')
        .result<ArrayBuffer>()
        .build()

    export const remove = Instance.queryClient.delete('/document/:id')
        .result<void>()
        .build()

}
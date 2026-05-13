import type { Result } from "@niloc/utils";
import { Instance } from "../../Instance";
import { Fetch } from "../../resources/fetch/Fetch";
import type { DocumentEntity } from "./DocumentEntity";

export namespace DocumentQueries {

    export function get(id: string): Promise<Result<DocumentEntity, Error>> {
        const fetch = Instance.engine.getResource(Fetch)
        return fetch.apiAuth.get<DocumentEntity>('document/' + id)
    }

}
import type { QuerySpecification } from "./QuerySpecification"

export class QueryClient {

    private _baseUrl: string

    constructor(baseUrl: string) {
        this._baseUrl = baseUrl
    }

    async get<const Path extends string, T extends Omit<QuerySpecification, 'method' | 'body', 'path'>>(path: Path, specification?: T) {
        return new Query<T & { path: Path }>({
            queryClient: this,
            path,
            ...specification,
        })
    }

}
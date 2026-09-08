import { Query } from "./Query"
import { QueryMethod } from "./QueryMethod"
import type { QuerySpecification } from "./QuerySpecification"

export class QueryClient {

    private _baseUrl: string

    constructor(baseUrl: string) {
        this._baseUrl = baseUrl
    }

    get baseUrl() {
        return this._baseUrl
    }

    get<Result, const Path extends string = string, const T extends Omit<QuerySpecification, 'method' | 'result' | 'body'> = { path: string }>(specification?: T): Query<T & {
        path: Path,
        result: Result,
        method: typeof QueryMethod.Get
    }> {
        return new Query<T & {
            path: Path,
            result: Result,
            method: typeof QueryMethod.Get
        }>(this, {
            ...specification,
            method: QueryMethod.Get
        } as any)
    }

    post<Result, const Path extends string = string, const T extends Omit<QuerySpecification, 'method' | 'result'> = { path: string }>(specification?: T): Query<T & {
        path: Path,
        result: Result,
        method: typeof QueryMethod.Post
    }> {
        return new Query<T & {
            path: Path,
            result: Result,
            method: typeof QueryMethod.Post
        }>(this, {
            ...specification,
            method: QueryMethod.Post
        } as any)
    }

    put<Result, const Path extends string = string, const T extends Omit<QuerySpecification, 'method' | 'result'> = { path: string }>(specification?: T): Query<T & {
        path: Path,
        result: Result,
        method: typeof QueryMethod.Put
    }> {
        return new Query<T & {
            path: Path,
            result: Result,
            method: typeof QueryMethod.Put
        }>(this, {
            ...specification,
            method: QueryMethod.Put
        } as any)
    }

    patch<Result, const Path extends string = string, const T extends Omit<QuerySpecification, 'method' | 'result'> = { path: string }>(specification?: T): Query<T & {
        path: Path,
        result: Result,
        method: typeof QueryMethod.Patch
    }> {
        return new Query<T & {
            path: Path,
            result: Result,
            method: typeof QueryMethod.Patch
        }>(this, {
            ...specification,
            method: QueryMethod.Patch
        } as any)
    }

    delete<Result, const Path extends string = string, const T extends Omit<QuerySpecification, 'method' | 'result'> = { path: string }>(specification?: T): Query<T & {
        path: Path,
        result: Result,
        method: typeof QueryMethod.Delete
    }> {
        return new Query<T & {
            path: Path,
            result: Result,
            method: typeof QueryMethod.Delete
        }>(this, {
            ...specification,
            method: QueryMethod.Delete
        } as any)
    }

}
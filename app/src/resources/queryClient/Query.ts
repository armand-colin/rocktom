import { Result } from "@niloc/utils";
import { Path } from "./Path";
import type { QueryClient } from "./QueryClient"
import type { QuerySpecification } from "./QuerySpecification";
import type { Body } from "./Body";
import type { QueryMethod } from "./QueryMethod";

export class Query<T extends QuerySpecification> {

    private _path: Path<string>
    private _method: QueryMethod

    constructor(readonly queryClient: QueryClient, specifications: T) {
        this._method = specifications.method
        this._path = new Path(specifications.path)
    }

    async run(options: Query.RunArguments<T>): Promise<Result<QuerySpecification.ResultOf<T>, Query.Error>> {
        const search = new URLSearchParams()
        for (const [key, value] of Object.entries(((options as any).search as Record<string, string | number>) ?? {})) {
            search.set(key, value.toString())
        }

        let url = this.queryClient.baseUrl + this._path.compile(options)
        if (search.size > 0) {
            url += `?${search.toString()}`
        }

        try {
            const response = await fetch(url, {
                body: (options as any).body,
                headers: (options as any).headers,
                method: this._method,
            })

            if (response.ok) {
                // TODO: add parsing of the response
                return Result.ok(true as QuerySpecification.ResultOf<T>)
            } else {
                return Result.error(new Query.CodeError(response))
            }
        } catch (error) {
            return Result.error(new Query.NetworkError(error))
        }
    }

}

export namespace Query {

    type Flatten<T> = {
        [key in keyof T]: T[key]
    }

    type IsUndefined<T> = T extends void ?
        true :
        T extends undefined ?
        true :
        [keyof T] extends [never] ?
        true :
        false

    type _RunArguments<T extends QuerySpecification> =
        (IsUndefined<QuerySpecification.BodyOf<T>> extends true ? {} : {
            body: Body<QuerySpecification.BodyOf<T>>
        }) & (IsUndefined<QuerySpecification.SearchOf<T>> extends true ? {} : {
            search: QuerySpecification.SearchOf<T>
        }) & (IsUndefined<Path.Arguments<QuerySpecification.PathOf<T>>> extends true ? {} : {
            path: Path.Arguments<QuerySpecification.PathOf<T>>
        }) & (IsUndefined<QuerySpecification.HeadersOf<T>> extends true ? {} : {
            headers: QuerySpecification.HeadersOf<T>
        })

    export type RunArguments<T extends QuerySpecification> = Flatten<_RunArguments<T>>

    export abstract class Error extends globalThis.Error {

        constructor(message: string) {
            super(message)
        }
    
    }

    export class NetworkError extends Error {

        constructor(readonly native: unknown) {
            super("")
        }

    }

    export class CodeError extends Error {

        constructor(readonly response: Response) {
            super("")
        }

    }

}
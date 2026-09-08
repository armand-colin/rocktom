import { Result } from "@niloc/utils";
import { Path } from "./Path";
import type { QueryClient } from "./QueryClient"
import type { QuerySpecification } from "./QuerySpecification";

export class Query<T extends QuerySpecification> {

    private _specifications: T
    private _path: Path<string>

    constructor(readonly queryClient: QueryClient, specifications: T) {
        this._specifications = specifications
        this._path = new Path(specifications.path)
    }

    async run(options: Query.RunArguments<T>): Promise<Result<QuerySpecification.Result<T>, Query.Error>> {
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
                method: this._specifications.method,
            })

            if (response.ok) {
                return Result.ok(true as QuerySpecification.Result<T>)
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
        (IsUndefined<QuerySpecification.Body<T>> extends true ? {} : {
            body: QuerySpecification.Body<T>
        }) & (IsUndefined<QuerySpecification.Search<T>> extends true ? {} : {
            search: QuerySpecification.Search<T>
        }) & (IsUndefined<Path.Arguments<QuerySpecification.Path<T>>> extends true ? {} : {
            path: Path.Arguments<QuerySpecification.Path<T>>
        }) & (IsUndefined<QuerySpecification.Headers<T>> extends true ? {} : {
            headers: QuerySpecification.Headers<T>
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
import { Result } from "@niloc/utils";
import { Path } from "./Path";
import type { QueryClient } from "./QueryClient"
import type { QuerySpecification } from "./QuerySpecification";
import type { QueryMethod } from "./QueryMethod";
import { QueryContext } from "./QueryContext";
import type { QueryResult } from "./QueryHandler";
import type { StatusCode } from "./StatusCode";

function cleanup<T>(object: T): T {
    const copy = { ...object }

    const keysToDelete = []

    for (const key in copy) {
        if (copy[key] === undefined) {
            keysToDelete.push(key)
        }
    }

    for (const key of keysToDelete) {
        delete copy[key]
    }

    return copy
}

type QueryRunner<T> = (context: QueryContext) => Promise<QueryResult<T>>

export class Query<T extends QuerySpecification> {

    private _path: Path<string>
    private _method: QueryMethod

    constructor(readonly queryClient: QueryClient, specifications: T) {
        this._method = specifications.method
        this._path = new Path(specifications.path)
    }

    run = async (options: Query.RunArguments<T>): Promise<QueryResult<QuerySpecification.ResultOf<T>>> => {
        const context = new QueryContext({
            queryClient: this.queryClient,
            body: (options as any).body,
            headers: (options as any).headers,
            method: this._method,
            path: this._path,
            pathArguments: (options as any).path,
            search: (options as any).search,
            retryCount: 0,
            signal: (options as any).signal ?? null
        })

        let runner: QueryRunner<T> = (context) => {
            return Query.run(context)
        }

        const interceptors = this.queryClient.interceptors

        for (let i = interceptors.length - 1; i >= 0; i--) {
            const interceptor = interceptors[i]
            const lastRunner = runner
            const newRunner: QueryRunner<T> = (context) => {
                return interceptor.handle(context, (context) => {
                    return lastRunner(context)
                })
            }
            runner = newRunner
        }

        while (true) {
            const newContext = context.clone()

            const result = await runner(newContext)

            if (!result.ok && newContext.signal?.aborted) {
                return Result.error(new Query.AbortedError(result.error))
            }

            if (result.ok && newContext.signal?.aborted) {
                return Result.error(new Query.AbortedError(result.value))
            }

            // TODO: maybe check for result.ok?
            if (newContext.shallRetry) {
                context.setRetryCount(context.retryCount + 1)
                continue
            }

            return result
        }
    }

    static async run<T extends QuerySpecification>(context: QueryContext): Promise<QueryResult<QuerySpecification.ResultOf<T>>> {
        const search = new URLSearchParams()
        const searchParams = cleanup((context.search as Record<string, string | number>) ?? {})

        for (const [key, value] of Object.entries(searchParams)) {
            search.set(key, value.toString())
        }

        const compiledPath = context.path.compile(context.pathArguments)

        if (!compiledPath.ok) {
            return Result.error(new Query.PathError(context.path, compiledPath.error))
        }

        let url = context.queryClient.baseUrl + compiledPath.value
        if (search.size > 0) {
            url += `?${search.toString()}`
        }

        const body = context.body
        if (body) {
            context.setHeaders(body.headers)
        }

        try {
            const response = await context.queryClient.fetch(url, {
                body: body ? body.data : undefined,
                headers: cleanup({ ...context.headers }),
                method: context.method,
                credentials: 'include',
            })

            if (!response.ok) {
                return Result.error(new Query.CodeError(response))
            }

            const contentType = response.headers.get('Content-Type')

            if (contentType?.startsWith('application/json')) {
                return Result.ok(await response.json() as QuerySpecification.ResultOf<T>)
            }

            if (
                contentType === "application/octet-stream" ||
                contentType?.startsWith('audio/')
            ) {
                return Result.ok(await response.arrayBuffer() as QuerySpecification.ResultOf<T>)
            }

            return Result.ok(await response.text() as QuerySpecification.ResultOf<T>)
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

    type _RunArguments<T extends QuerySpecification> = {
        signal?: AbortSignal,
    } &
        (IsUndefined<QuerySpecification.BodyOf<T>> extends true ? {} : {
            body: QuerySpecification.BodyOf<T>
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

        readonly statusCode: StatusCode

        constructor(readonly response: Response) {
            super("")
            this.statusCode = response.status as StatusCode
        }

    }

    export class UnauthorizedError extends Error {

        constructor() {
            super("Unauthorized")
        }

    }

    export class PathError extends Error {

        constructor(readonly path: Path<string>, error: Path.CompileError) {
            super(`Path ${path.path} could not compile: ${error.message}`)
        }

    }

    export class AbortedError extends Error {

        constructor(readonly native: unknown) {
            super("Aborted")
        }

    }

}
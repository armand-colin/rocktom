import { Query } from "./Query"
import type { QueryInterceptor } from "./QueryIntecteptor"
import { QueryMethod } from "./QueryMethod"

class QueryBuilder<T extends {
    method: QueryMethod,
    path: string,
    body: any,
    search: Record<string, string>,
    result: any,
    headers: Record<string, string>
}> {

    private readonly _options: T

    static create<Path extends string = string, Method extends QueryMethod = QueryMethod>(client: QueryClient, path: Path, method: Method): QueryBuilder<{
        method: Method,
        path: Path,
        body: void,
        search: {},
        result: void,
        headers: {}
    }> {
        return new QueryBuilder(client, {
            method,
            path,
            body: undefined,
            search: {},
            result: undefined,
            headers: {}
        })
    }

    constructor(readonly client: QueryClient, options: T) {
        this._options = options
    }

    result<R>(): QueryBuilder<{
        method: T['method'],
        path: T['path'],
        body: T['body'],
        search: T['search'],
        result: R,
        headers: T['headers']
    }> {
        return new QueryBuilder(this.client, {
            ...this._options,
            result: null as R
        })
    }

    body<B>(): QueryBuilder<{
        method: T['method'],
        path: T['path'],
        body: B,
        search: T['search'],
        result: T['result'],
        headers: T['headers']
    }> {
        return new QueryBuilder(this.client, {
            ...this._options,
            body: null as B
        })
    }

    search<S extends Record<string, string>>(): QueryBuilder<{
        method: T['method'],
        path: T['path'],
        body: T['body'],
        search: S,
        result: T['result'],
        headers: T['headers']
    }> {
        return new QueryBuilder(this.client, {
            ...this._options,
            search: {} as S
        })
    }

    header<H extends string>(): QueryBuilder<{
        method: T['method'],
        path: T['path'],
        body: T['body'],
        search: T['search'],
        result: T['result'],
        headers: { [key in (H | (keyof T['headers']))]: string }
    }> {
        return new QueryBuilder(this.client, {
            ...this._options,
            headers: {} as { [key in (H | (keyof T['headers']))]: string }
        })
    }

    build(): Query<T> {
        return new Query(this.client, {
            ...this._options,
            result: this._options.result
        })
    }

}

export class QueryClient {

    private _baseUrl: string
    private _interceptors: QueryInterceptor[]

    readonly fetch: typeof globalThis.fetch = fetch.bind(window)

    constructor(
        baseUrl: string,
        interceptors: QueryInterceptor[],
        fetch?: typeof globalThis.fetch
    ) {
        this._baseUrl = baseUrl
        this._interceptors = interceptors
        this.fetch = fetch ?? globalThis.fetch
    }

    get baseUrl() {
        return this._baseUrl
    }

    get interceptors() {
        return this._interceptors
    }

    addInterceptor(interceptor: QueryInterceptor) {
        this._interceptors.push(interceptor)
        return this
    }

    post<Path extends string = string>(path: Path) {
        return QueryBuilder.create(this, path, QueryMethod.Post)
    }

    get<Path extends string = string>(path: Path) {
        return QueryBuilder.create(this, path, QueryMethod.Get)
    }

    put<Path extends string = string>(path: Path) {
        return QueryBuilder.create(this, path, QueryMethod.Put)
    }

    delete<Path extends string = string>(path: Path) {
        return QueryBuilder.create(this, path, QueryMethod.Delete)
    }

    patch<Path extends string = string>(path: Path) {
        return QueryBuilder.create(this, path, QueryMethod.Patch)
    }

}

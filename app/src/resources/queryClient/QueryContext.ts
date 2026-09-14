import type { Body } from "./Body";
import type { Path } from "./Path";
import type { QueryClient } from "./QueryClient";
import type { QueryMethod } from "./QueryMethod";

export class QueryContext {

    readonly queryClient: QueryClient

    private _headers: Record<string, string> = {}
    private _method: QueryMethod
    private _path: Path<string>
    private _pathArguments: Record<string, string> = {}
    private _search: Record<string, string | number | boolean> = {}
    private _body: Body<any> | null
    private _retryCount: number = 0
    private _shallRetry: boolean = false

    constructor(options: {
        queryClient: QueryClient,
        headers: Record<string, string>,
        path: Path<string>,
        pathArguments: Record<string, string>,
        search: Record<string, string | number | boolean>,
        method: QueryMethod,
        body: Body<any> | null,
        retryCount: number
    }) {
        this.queryClient = options.queryClient

        this._method = options.method
        this._path = options.path
        this._pathArguments = options.pathArguments
        this._search = options.search
        this._headers = options.headers
        this._body = options.body
        this._retryCount = options.retryCount
    }

    get shallRetry() {
        return this._shallRetry
    }

    get retryCount() {
        return this._retryCount
    }

    get search() {
        return this._search
    }

    get pathArguments() {
        return this._pathArguments
    }

    get path() {
        return this._path
    }

    get method() {
        return this._method
    }

    get headers() {
        return this._headers
    }

    get body() {
        return this._body
    }

    retry() {
        this._shallRetry = true
        return this
    }

    setHeaders(headers: Record<string, string>) {
        this._headers = {...this._headers, ...headers}
        return this
    }

    setRetryCount(retryCount: number) {
        this._retryCount = retryCount
        return this
    }

    clone() {
        return new QueryContext({
            queryClient: this.queryClient,
            path: this._path,
            pathArguments: {...this._pathArguments},
            search: {...this._search},
            method: this._method,
            body: this._body,
            headers: {...this._headers},
            retryCount: this._retryCount
        })
    }

}
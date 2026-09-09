import type { Declaration } from "./Declaration"
import type { QueryMethod } from "./QueryMethod"

export type QuerySpecification = {
    path: string,
    method: QueryMethod,
    result?: any,
    headers?: Record<string, string>,
    body?: any,
    search?: Record<string, string | number>,
}

export namespace QuerySpecification {

    export type BodyOf<T extends QuerySpecification> = T['body']
    export type SearchOf<T extends QuerySpecification> = T['search']
    export type HeadersOf<T extends QuerySpecification> = T['headers']
    export type MethodOf<T extends QuerySpecification> = T['method']
    export type PathOf<T extends QuerySpecification> = T['path']
    export type ResultOf<T extends QuerySpecification> = T['result']

    const DeclarationMarker = Symbol("ResultMarker")

    export type Declaration<T> = {
        [DeclarationMarker]: T
    }

    export function declare<T>(): Declaration<T> {
        return {
            [DeclarationMarker]: null as T
        }
    }

}

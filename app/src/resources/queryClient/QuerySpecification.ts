import type { QueryMethod } from "./QueryMethod"

export type QuerySpecification = {
    path: string,
    method: QueryMethod,
    result?: any,
    error?: any,
    headers?: any,
    body?: any,
    search?: Record<string, string | number>,
}

export namespace QuerySpecification {

    export type Body<T extends QuerySpecification> = T['body']
    export type Search<T extends QuerySpecification> = T['search']
    export type Headers<T extends QuerySpecification> = T['headers']
    export type Error<T extends QuerySpecification> = T['error']
    export type Method<T extends QuerySpecification> = T['method']
    export type Path<T extends QuerySpecification> = T['path']
    export type Result<T extends QuerySpecification> = T['result']

}

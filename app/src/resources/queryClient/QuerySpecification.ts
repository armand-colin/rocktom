import type { QueryMethod } from "./QueryMethod"

export type QuerySpecification = {
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    result?: any,
    error?: any,
    headers?: any,
    body?: any,
    search?: any,
}

export namespace QuerySpecification {

    export type Body<T extends QuerySpecification> = T['body']
    export type Search<T extends QuerySpecification> = T['search']
    export type Headers<T extends QuerySpecification> = T['headers']
    export type Result<T extends QuerySpecification> = T['result']
    export type Error<T extends QuerySpecification> = T['error']
    export type Method<T extends QuerySpecification> = T['method']
    export type Path<T extends QuerySpecification> = T['path']

    type Undefined = undefined | void | unknown | {}

    export type RunArguments<T extends QuerySpecification> =
        (Body<T> extends Undefined ? {} : {
            body: Body<T>
        }) & (Search<T> extends Undefined ? {} : {
            body: Search<T>
        })
}

type a = QuerySpecification.RunArguments<{
    method: typeof QueryMethod.Get,
    path: '/test',
    body: { me: string }
}>
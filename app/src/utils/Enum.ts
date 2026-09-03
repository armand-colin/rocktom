export type Enum<T extends Record<string, any>, U> = T & U & {
    values: T[keyof T][],
    keys: (keyof T)[],
    entries: [keyof T, T[keyof T]][]
}

export namespace Enum {

    export function create<T extends Record<string, any>, U = {}>(enumerator: T, extend?: U): Enum<T, U> {
        return {
            ...enumerator,
            ...extend,
            values: Object.values(enumerator),
            keys: Object.keys(enumerator),
            entries: Object.entries(enumerator)
        } as Enum<T, U>
    }

    export type Infer<E extends Enum<any, any>> = E extends Enum<infer T, infer _U> ? T[keyof T] : never

}

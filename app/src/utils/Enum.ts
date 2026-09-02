export type Enum<T extends Record<string, string | number>, U> = T & U & {
    all: T[keyof T][]
}

export namespace Enum {

    export function create<T extends Record<string, string | number>, U = {}>(enumerator: T, extend?: U): Enum<T, U> {
        return {
            ...enumerator,
            ...extend,
            all: Object.values(enumerator),
        } as Enum<T, U>
    }

    export type Infer<E extends Enum<any, any>> = E extends Enum<infer T, infer _U> ? T[keyof T] : never

}


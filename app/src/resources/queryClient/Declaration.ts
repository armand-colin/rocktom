const Marker = Symbol("DeclarationMarker")

export type Declaration<T> = {

    [Marker]: T

}

export namespace Declaration {

    export function create<T>(): Declaration<T> {
        return {
            [Marker]: null as T
        }
    }

}
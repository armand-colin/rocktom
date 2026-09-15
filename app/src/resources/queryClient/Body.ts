export type Body = Body.Json<any> |
    Body.Text |
    Body.Multipart<any>

export namespace Body {

    export const Marker = Symbol('BodyType')

    const JSONHeaders = {
        'Content-Type': 'application/json'
    }

    const TextHeaders = {
        'Content-Type': 'text/plain'
    }

    export class Json<T> {

        readonly type = 'json'
        readonly data: string
        readonly headers = JSONHeaders
        readonly [Marker]: T

        constructor(data: T) {
            this[Marker] = null as any as T
            this.data = JSON.stringify(data)
        }

    }

    export class Text {

        readonly type = 'text'
        readonly data: string
        readonly headers = TextHeaders

        constructor(data: string) {
            this.data = data
        }

    }

    export class Multipart<T extends Record<string, FormDataEntryValue>> {

        readonly type = 'multipart'
        readonly data: FormData
        readonly headers = {}

        readonly [Marker]: T

        constructor(data: T) {
            this[Marker] = null as any as T
            this.data = new FormData()
            for (const key in data) {
                this.data.append(key, data[key] as string)
            }
        }

    }

    export function json<T>(data: T): Json<T> {
        return new Json(data)
    }

    export function text(data: string): Text {
        return new Text(data)
    }

    export function multipart<T extends Record<string, FormDataEntryValue>>(data: T): Multipart<T> {
        return new Multipart(data)
    }

}
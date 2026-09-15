export type Body<T> = {
    [Body.Marker]: T,
    type: 'json',
    readonly data: string,
    readonly headers: Record<string, string>
} | {
    [Body.Marker]: T,
    type: 'text',
    readonly data: string,
    readonly headers: Record<string, string>
} | {
    [Body.Marker]: T,
    type: 'multipart',
    readonly data: FormData,
    readonly headers: Record<string, string>
}

export namespace Body {

    export const Marker = Symbol('BodyType')

    const JSONHeaders = {
        'Content-Type': 'application/json'
    }
    const TextHeaders = {
        'Content-Type': 'text/plain'
    }

    export function json<T>(data: T): Body<T> {
        return {
            type: 'json',
            [Marker]: null as T,
            data: JSON.stringify(data),
            headers: JSONHeaders
        }
    }

    export function text(data: string): Body<string> {
        return {
            type: 'text',
            [Marker]: "",
            data,
            headers: TextHeaders
        }
    }

    function createFormData(data: Record<string, FormDataEntryValue>): FormData {
        const formData = new FormData()

        for (const key in data) {
            formData.append(key, data[key])
        }

        return formData
    }

    export function multipart(data: FormData | Record<string, FormDataEntryValue>): Body<any> {
        let formData;
        if (data instanceof FormData) {
            formData = data
        } else {
            formData = new FormData()
            for (const key in data) {
                formData.append(key, data[key])
            }
        }

        return {
            type: 'multipart',
            [Marker]: null as any,
            data: data instanceof FormData ?
                data :
                createFormData(data),
            headers: {}
        }
    }

}
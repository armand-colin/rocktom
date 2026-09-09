export type Body<T> = {
    [Body.Marker]: T,
    type: 'json',
    data: string,
    headers: Record<string, string>
} | {
    [Body.Marker]: T,
    type: 'text',
    data: string,
    headers: Record<string, string>
} | {
    [Body.Marker]: T,
    type: 'multipart',
    data: FormData,
    headers: Record<string, string>
}

export namespace Body {

    export const Marker = Symbol('BodyType')

    export function json<T>(data: T): Body<T> {
        return {
            type: 'json',
            [Marker]: null as T,
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }

    export function text(data: string): Body<string> {
        return {
            type: 'text',
            [Marker]: "",
            data,
            headers: {}
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
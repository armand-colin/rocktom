export type Body = {
    type: 'json',
    data: string,
    headers: Record<string, string>
} | {
    type: 'text',
    data: string,
    headers: Record<string, string>
} | {
    type: 'multipart',
    data: FormData,
    headers: Record<string, string>
}

export namespace Body {

    export function json<T>(data: T): Body {
        return {
            type: 'json',
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }

    export function text(data: string): Body {
        return {
            type: 'text',
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

    export function multipart(data: FormData | Record<string, FormDataEntryValue>): Body {
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
            data: data instanceof FormData ?
                data :
                createFormData(data),
            headers: {}
        }
    }

}
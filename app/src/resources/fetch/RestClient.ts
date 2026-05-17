import { Result } from "@niloc/utils"
import type { AuthManager } from "../AuthManager"
import { StatusCodeError } from "./StatusCodeError"

type Body = {
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

type Headers = Record<string, string>

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

export class RestClient {

    private _baseUrl: string
    private _authManager: AuthManager | null

    constructor(baseUrl: string, authManager?: AuthManager) {
        this._baseUrl = baseUrl
        this._authManager = authManager ?? null
    }

    get<T>(url: string, headers?: Headers): Promise<Result<T, Error>> {
        return this._fetch(url, 'GET', undefined, headers)
    }

    post<T>(url: string, body?: Body, headers?: Headers): Promise<Result<T, Error>> {
        return this._fetch(url, 'POST', body, headers)
    }

    put<T>(url: string, body?: Body, headers?: Headers): Promise<Result<T, Error>> {
        return this._fetch(url, 'PUT', body, headers)
    }

    patch<T>(url: string, body?: Body, headers?: Headers): Promise<Result<T, Error>> {
        return this._fetch(url, 'PATCH', body, headers)
    }

    delete<T>(url: string, body?: Body, headers?: Headers): Promise<Result<T, Error>> {
        return this._fetch(url, 'DELETE', body, headers)
    }

    private async _fetch(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', body?: Body, additionnalHeaders?: Headers): Promise<Result<any, Error>> {
        const headers: Headers = {}

        if (body) {
            Object.assign(headers, body.headers)
        }

        if (this._authManager) {
            const accessToken = await this._authManager.getAccessToken()

            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`
            } else {
                return Result.error(new Error('No valid access token'))
            }
        }

        if (additionnalHeaders) {
            Object.assign(headers, additionnalHeaders)
        }

        let response: Response;
        try {
            response = await fetch(`${this._baseUrl}${url}`, {
                method,
                headers,
                body: body ? body.data : undefined,
                credentials: 'include',
            })
        } catch (error) {
            return Result.error(error as Error)
        }

        if (!response.ok) {
            return Result.error(new StatusCodeError(response))
        }

        const contentType = response.headers.get('Content-Type')

        if (contentType?.startsWith('application/json')) {
            return Result.ok(await response.json())
        }

        console.log('type', contentType);

        return Result.ok(await response.text())
    }

}
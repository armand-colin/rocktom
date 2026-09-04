import { Result } from "@niloc/utils"
import type { AuthManager } from "../AuthManager"
import { FetchError } from "./FetchError"
import type { Body } from "./Body"

type Headers = Record<string, string>

export class RestClient {

    private _baseUrl: string
    private _authManager: AuthManager | null

    constructor(baseUrl: string, authManager?: AuthManager) {
        this._baseUrl = baseUrl
        this._authManager = authManager ?? null
    }

    get<T>(url: string, headers?: Headers): Promise<Result<T, FetchError>> {
        return this._fetch(url, 'GET', undefined, headers)
    }

    post<T>(url: string, body?: Body, headers?: Headers): Promise<Result<T, FetchError>> {
        return this._fetch(url, 'POST', body, headers)
    }

    put<T>(url: string, body?: Body, headers?: Headers): Promise<Result<T, FetchError>> {
        return this._fetch(url, 'PUT', body, headers)
    }

    patch<T>(url: string, body?: Body, headers?: Headers): Promise<Result<T, FetchError>> {
        return this._fetch(url, 'PATCH', body, headers)
    }

    delete<T>(url: string, body?: Body, headers?: Headers): Promise<Result<T, FetchError>> {
        return this._fetch(url, 'DELETE', body, headers)
    }

    private async _fetch(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', body?: Body, additionnalHeaders?: Headers): Promise<Result<any, FetchError>> {
        const headers: Headers = {}

        if (body) {
            Object.assign(headers, body.headers)
        }

        if (this._authManager) {
            const accessToken = await this._authManager.getAccessToken()

            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`
            } else {
                return Result.error(new FetchError.MissingToken())
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
            return Result.error(new FetchError.Network(error as Error))
        }

        if (!response.ok) {
            return Result.error(new FetchError.StatusCode(response))
        }

        const contentType = response.headers.get('Content-Type')

        if (contentType?.startsWith('application/json')) {
            return Result.ok(await response.json())
        }

        if (
            contentType === "application/octet-stream" ||
            contentType?.startsWith('audio/')
        ) {
            return Result.ok(await response.arrayBuffer())
        }

        return Result.ok(await response.text())
    }

}
import { Engine, Resource } from "@niloc/ecs";
import { Fetch } from "./fetch/Fetch";
import { Body } from "./fetch/RestClient";
import { jwtDecode } from "jwt-decode";
import { Result } from "@niloc/utils";

type Session = {
    accessToken: string,
    refreshToken: string,
    userId: string,
    expiresAt: Date
}

type Tokens = {
    accessToken: string,
    refreshToken: string
}

// 30 seconds
const TOKEN_EXPIRATION_MARGIN = 1000 * 30

export class AuthManager extends Resource {

    private _session: Session | null = null
    private _refreshPromise: Promise<Result<Tokens, Error>> | null = null

    constructor(engine: Engine) {
        super(engine)
    }

    requestCode(email: string) {
        const fetch = this.engine.getResource(Fetch)
        return fetch.api.post('/session/code', Body.json({ email }))
    }

    get isAuthenticated(): boolean {
        return !!this._session
    }

    async getAccessToken(): Promise<string | null> {
        if (this._session && this._session.expiresAt > new Date(Date.now() + TOKEN_EXPIRATION_MARGIN)) {
            return this._session.accessToken;
        }

        if (this._session) {
            // Else must refresh
            const result = await this._refresh(this._session.refreshToken)

            if (result.ok) {
                return result.value.accessToken
            } else {
                return null
            }
        }

        // User is not authenticated at all, we must end this session
        return null
    }

    async login(email: string, code: string) {
        const fetch = this.engine.getResource(Fetch)
        try {
            const response = await fetch.api.post<Tokens>('/session/login', Body.json({ email, code }))

            if (!response.ok) {
                return Result.error(response.error)
            }

            this._session = this._parseTokens(response.value)
            this.changed()

            return Result.ok(undefined)
        } catch (error) {
            console.error('login error', error)
            return Result.error(error)
        }
    }

    private _parseTokens(tokens: Tokens): Session {
        const payload = jwtDecode(tokens.accessToken)

        if (!payload.sub || !payload.exp) {
            throw new Error('Invalid access token')
        }

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            userId: payload.sub,
            expiresAt: new Date(payload.exp * 1000)
        }
    }

    private async _refresh(refreshToken: string): Promise<Result<Tokens, Error>> {
        if (this._refreshPromise)
            return this._refreshPromise

        this._refreshPromise = new Promise<Result<Tokens, Error>>(async (resolve) => {
            const fetch = this.engine.getResource(Fetch)
            const response = await fetch.api.post<Tokens>(
                '/session/refresh',
                undefined,
                { 'Authorization': `Bearer ${refreshToken}` }
            )
    
            if (response.ok) {
                this._session = this._parseTokens(response.value)
                resolve(Result.ok(response.value))
            } else {
                resolve(Result.error(response.error))
            }
        }).finally(() => {
            this._refreshPromise = null
        })

        return this._refreshPromise
    }

}
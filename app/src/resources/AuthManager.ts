import { Engine, Resource } from "@niloc/ecs";
import { jwtDecode } from "jwt-decode";
import { Result } from "@niloc/utils";
import { SessionQueries } from "../queries/session/SessionQueries";
import { AuthStore, type Session } from "./AuthStore";


type Tokens = {
    accessToken: string,
    refreshToken: string
}

// 30 seconds
const TOKEN_EXPIRATION_MARGIN = 1000 * 30

export class AuthManager extends Resource {

    private _store: AuthStore
    private _refreshPromise: Promise<Result<Tokens, Error>> | null = null

    constructor(engine: Engine) {
        super(engine)
        this._store = engine.getResource(AuthStore)
    }

    requestCode(username: string) {
        return SessionQueries.requestCode(username)
    }

    get isAuthenticated(): boolean {
        return this._store.isAuthenticated
    }

    async getAccessToken(): Promise<string | null> {
        if (this._store.session && this._store.session.expiresAt > new Date(Date.now() + TOKEN_EXPIRATION_MARGIN)) {
            return this._store.session.accessToken;
        }

        if (this._store.session) {
            // Else must refresh
            const result = await this._refresh(this._store.session.refreshToken)

            if (result.ok) {
                return result.value.accessToken
            } else {
                return null
            }
        }

        // User is not authenticated at all, we must end this session
        return null
    }

    async login(username: string, code: string) {
        try {
            const response = await SessionQueries.login(username, code)

            if (!response.ok) {
                return Result.error(response.error)
            }

            const session = this._parseTokens(response.value)
            this._store.setSession(session)
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

    restore() {
        return this._refresh()
    }

    private async _refresh(refreshToken?: string): Promise<Result<Tokens, Error>> {
        if (this._refreshPromise)
            return this._refreshPromise

        this._refreshPromise = new Promise<Result<Tokens, Error>>(async (resolve) => {
            const response = await SessionQueries.refresh(refreshToken)
    
            if (response.ok) {
                const session = this._parseTokens(response.value)
                this._store.setSession(session)
                this.changed()
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
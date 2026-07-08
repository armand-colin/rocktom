import { Resource } from "@niloc/ecs";

export type Session = {
    accessToken: string,
    refreshToken: string,
    userId: string,
    expiresAt: Date
}

export class AuthStore extends Resource {

    private _session: Session | null = null

    get isAuthenticated(): boolean {
        return !!this._session
    }

    get session(): Session | null {
        return this._session
    }

    setSession(session: Session | null) {
        this._session = session
        this.changed()
    }

}
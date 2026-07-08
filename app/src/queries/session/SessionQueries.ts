import { Instance } from "../../Instance";
import { Fetch } from "../../resources/fetch/Fetch";
import { Body } from "../../resources/fetch/RestClient";
import type { SessionTokensEntity } from "./SessionEntity";

export namespace SessionQueries {

    export function requestCode(username: string) {
        const fetch = Instance.engine.getResource(Fetch)
        return fetch.api.post('/session/code', Body.json({ username }));
    }

    export function login(username: string, code: string) {
        const fetch = Instance.engine.getResource(Fetch)
        return fetch.api.post<SessionTokensEntity>('/session/login', Body.json({ username, code }));
    }

    export function logout() {
        const fetch = Instance.engine.getResource(Fetch)
        return fetch.api.post('/session/logout');
    }

    export function refresh(refreshToken?: string) {
        const fetch = Instance.engine.getResource(Fetch)
        return fetch.api.post<SessionTokensEntity>(
            '/session/refresh',
            undefined,
            refreshToken ?
                { 'Authorization': `Bearer ${refreshToken}` } :
                undefined
        );
    }

}

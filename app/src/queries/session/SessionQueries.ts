import { Instance } from "../../Instance";
import { Fetch } from "../../resources/fetch/Fetch";
import { Body } from "../../resources/fetch/RestClient";
import type { SessionTokensEntity } from "./SessionEntity";

export namespace SessionQueries {

    const fetch = Instance.engine.getResource(Fetch);

    export function requestCode(username: string) {
        return fetch.api.post('/session/code', Body.json({ username }));
    }

    export function login(username: string, code: string) {
        return fetch.api.post<SessionTokensEntity>('/session/login', Body.json({ username, code }));
    }

    export function refresh(refreshToken: string) {
        return fetch.api.post<SessionTokensEntity>(
            '/session/refresh',
            undefined,
            { 'Authorization': `Bearer ${refreshToken}` }
        );
    }

}

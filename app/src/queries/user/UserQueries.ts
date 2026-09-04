import { Instance } from "../../Instance";
import { Body } from "../../resources/fetch/Body";
import { Fetch } from "../../resources/fetch/Fetch";
import type { UserEntity } from "./UserEntity";

export namespace UserQueries {

    const fetch = Instance.engine.getResource(Fetch);

    export function register(email: string, username: string) {
        return fetch.api.post<UserEntity>('/user/register', Body.json({ email, username }));
    }

    export function login(email: string) {
        return fetch.api.post<UserEntity>('/user/login', Body.json({ email }));
    }

    export function me() {
        return fetch.apiAuth.get<UserEntity>('/user/me');
    }

}

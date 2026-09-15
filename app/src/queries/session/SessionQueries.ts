import { Body } from "../../resources/queryClient/Body";
import { QueryClient } from "../../resources/queryClient/QueryClient";
import type { SessionTokensEntity } from "./SessionEntity";

export namespace SessionQueries {

    const sessionClient = new QueryClient(import.meta.env.VITE_API_URL, [])

    export const requestCode = sessionClient.post('/session/code')
        .body<Body.Json<{ username: string }>>()
        .build()

    export const login = sessionClient.post('/session/login')
        .body<Body.Json<{ username: string, code: string }>>()
        .result<SessionTokensEntity>()
        .build()

    export const logout = sessionClient.post('/session/logout')
        .result<void>()
        .build()
    
    export const refresh = sessionClient.post('/session/refresh')
        .result<SessionTokensEntity>()
        .headers<{ Authorization?: string }>()
        .build()

}

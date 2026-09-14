import { QueryClient } from "../../resources/queryClient/QueryClient";
import type { SessionTokensEntity } from "./SessionEntity";

export namespace SessionQueries {

    const sessionClient = new QueryClient(import.meta.env.VITE_API_URL, [])

    export const requestCode = sessionClient.post('/session/code')
        .body<{ username: string }>()
        .build()

    export const login = sessionClient.post('/session/login')
        .body<{ username: string, code: string }>()
        .result<SessionTokensEntity>()
        .build()

    export const logout = sessionClient.post('/session/logout')
        .result<void>()
        .build()
    
    export const refresh = sessionClient.post('/session/refresh')
        .result<SessionTokensEntity>()
        .header<'Authorization'>()
        .build()

}

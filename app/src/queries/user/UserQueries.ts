import { Instance } from "../../Instance";
import type { Body } from "../../resources/queryClient/Body";
import { QueryClient } from "../../resources/queryClient/QueryClient";
import type { UserEntity } from "./UserEntity";

export namespace UserQueries {

    const client = new QueryClient(import.meta.env.VITE_API_URL, [])

    export const register = client.post('/user/register')
        .body<Body.Json<{ email: string, username: string }>>()
        .result<UserEntity>()
        .build()

    export const me = Instance.queryClient.get('/user/me')
        .result<UserEntity>()
        .build()

}

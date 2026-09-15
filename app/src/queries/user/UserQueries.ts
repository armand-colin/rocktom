import { Instance } from "../../Instance";
import type { Body } from "../../resources/queryClient/Body";
import type { UserEntity } from "./UserEntity";

export namespace UserQueries {

    export const register = Instance.queryClient.post('/user/register')
        .body<Body.Json<{ email: string, username: string }>>()
        .result<UserEntity>()
        .build()

    export const me = Instance.queryClient.get('/user/me')
        .result<UserEntity>()
        .build()

}

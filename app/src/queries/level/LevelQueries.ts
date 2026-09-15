import { Instance } from "../../Instance";
import type { Body } from "../../resources/queryClient/Body";
import type { LevelEntity } from "./LevelEntity";

type CreateLevel = {
    name: string,
    instrumentTypes: string[],
}

type UpdateLevel = {
    name: string,
    serialized: string,
    duration: number,
    playbackId: string | null,
    instrumentTypes: string[],
}

type UpdateLevelShare = {
    permission: 'read' | 'write',
    enabled: boolean,
}

export namespace LevelQueries {

    export const getAll = Instance.queryClient.get('/level')
        .result<LevelEntity[]>()
        .build();

    export const create = Instance.queryClient.post('/level')
        .result<LevelEntity>()
        .body<Body.Json<CreateLevel>>()
        .build()

    export const getById = Instance.queryClient.get('/level/:id')
        .result<LevelEntity>()
        .build()

    export const update = Instance.queryClient.put('/level/:id')
        .result<LevelEntity>()
        .body<Body.Json<UpdateLevel>>()
        .build()

    export const remove = Instance.queryClient.delete('/level/:id')
        .result<void>()
        .build()

    export const share = Instance.queryClient.post('/level/:id/share')
        .result<LevelEntity.Share>()
        .build()

    export const updateShare = Instance.queryClient.put('/level/:id/share')
        .result<LevelEntity.Share>()
        .body<Body.Json<UpdateLevelShare>>()
        .build()

    export const acceptShare = Instance.queryClient.post('/level/share/:token/accept')
        .result<LevelEntity>()
        .build()

    export const getSharePreview = Instance.queryClient.get('/level/share/:token')
        .result<LevelEntity.SharePreview>()
        .build()

}

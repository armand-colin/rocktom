import { Instance } from "../../Instance";
import { Fetch } from "../../resources/fetch/Fetch";
import { Body } from "../../resources/fetch/RestClient";
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

export namespace LevelQueries {

    export function getAll() {
        const fetch = Instance.engine.getResource(Fetch);
        return fetch.apiAuth.get<LevelEntity[]>('/level');
    }

    export function create(body: CreateLevel) {
        const fetch = Instance.engine.getResource(Fetch);
        return fetch.apiAuth.post<LevelEntity>('/level', Body.json(body));
    }

    export function getById(id: string) {
        const fetch = Instance.engine.getResource(Fetch);
        return fetch.apiAuth.get<LevelEntity>(`/level/${id}`);
    }

    export function update(id: string, level: UpdateLevel) {
        const fetch = Instance.engine.getResource(Fetch);
        return fetch.apiAuth.put<LevelEntity>(`/level/${id}`, Body.json(level));
    }

    export function remove(id: string) {
        const fetch = Instance.engine.getResource(Fetch);
        return fetch.apiAuth.delete<void>(`/level/${id}`);
    }

}

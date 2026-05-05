import { Instance } from "../../Instance";
import { Fetch } from "../../resources/fetch/Fetch";
import { Body } from "../../resources/fetch/RestClient";
import type { LevelEntity } from "./LevelEntity";

export namespace LevelQueries {

    export function getAll() {
        const fetch = Instance.engine.getResource(Fetch);
        return fetch.apiAuth.get<LevelEntity[]>('/level');
    }

    export function create(name: string) {
        const fetch = Instance.engine.getResource(Fetch);
        return fetch.apiAuth.post<LevelEntity>('/level', Body.json({ name }));
    }

    export function getById(id: string) {
        const fetch = Instance.engine.getResource(Fetch);
        return fetch.apiAuth.get<LevelEntity>(`/level/${id}`);
    }

}

import { Instance } from "../../Instance";
import { Fetch } from "../../resources/fetch/Fetch";
import type { LevelEntity } from "./LevelEntity";

export namespace LevelQueries {

    export function getAll() {
        const fetch = Instance.engine.getResource(Fetch);
        return fetch.apiAuth.get<LevelEntity[]>('/level');
    }

}

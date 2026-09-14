import { Engine } from "@niloc/ecs";
import { QueryClient } from "./resources/queryClient/QueryClient";

export namespace Instance {

    export const engine = new Engine()
    export const queryClient = new QueryClient(import.meta.env.VITE_API_URL, [])

}
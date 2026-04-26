import { Engine, Resource } from "@niloc/ecs";
import { RestClient } from "./RestClient";
import { AuthManager } from "../AuthManager";

export class Fetch extends Resource {

    readonly api: RestClient
    readonly apiAuth: RestClient;

    constructor(engine: Engine) {
        super(engine)

        const authManager = engine.getResource(AuthManager)

        this.api = new RestClient(import.meta.env.VITE_API_URL)
        this.apiAuth = new RestClient(import.meta.env.VITE_API_URL, authManager)
    }

}
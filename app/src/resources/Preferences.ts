import { Engine, Resource } from "@niloc/ecs"
import type { PreferencesScope } from "./PreferencesScope"

export class Preferences extends Resource {

    private _scopes: PreferencesScope[] = []

    constructor(engine: Engine) {
        super(engine)
    }

    register(scope: PreferencesScope) {
        this._scopes.push(scope)
    }

    initialize() {
        for (const scope of this._scopes)
            scope.recover()
    }

}

import { Engine, Resource } from "@niloc/ecs"
import type { PreferencesScope } from "./PreferencesScope"

interface PreferencesScopeConstructor {
    new (engine: Engine): PreferencesScope
}

export class Preferences extends Resource {

    private _scopes: PreferencesScope[] = []

    constructor(engine: Engine) {
        super(engine)
    }

    register(scopes: PreferencesScopeConstructor[]) {
        for (const constructor of scopes) {
            const instance = this.engine.getResource(constructor)
            this._scopes.push(instance)
        }

        return this
    }

    recover() {
        for (const scope of this._scopes)
            scope.recover()
    }

}

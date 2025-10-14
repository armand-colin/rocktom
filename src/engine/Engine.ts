import { SoundEngine } from "../sound/SoundEngine";
import type { Constructor } from "./Constructor";
import { Coroutine } from "./Coroutine";
import type { Resource } from "./Resource";
import type { Schedule } from "./Schedule";
import { Scheduler } from "./Scheduler";

export type Initializer<T> = (engine: Engine) => T

export class Engine {

    static readonly instance = new Engine()

    private _resources = new Map<Constructor<Resource>, Resource>()
    private _scheduler = new Scheduler()

    private _initializers = new Map<Constructor<unknown>, Initializer<unknown>>()

    readonly sound = new SoundEngine()

    resource<T extends Resource>(constructor: Constructor<T>): T {
        if (this._resources.has(constructor))
            return this._resources.get(constructor) as T

        if (this._initializers.has(constructor)) {
            const instance = this._initializers.get(constructor)!(this) as T
            this._resources.set(constructor, instance)
            return instance
        }

        if (constructor.length > 0) {
            throw new Error("Resource has no initializer, but constructor needs more than one argument")
        }

        const resource = new constructor()
        this._resources.set(constructor, resource)

        return resource
    }

    initialize<T>(constructor: Constructor<T>, initializer: Initializer<T>) {
        this._initializers.set(constructor, initializer)
    }

    coroutine(coroutine: Iterator<Schedule>) {
        const _coroutine = new Coroutine(coroutine)
        this._scheduler.add(_coroutine)
        return _coroutine
    }

}
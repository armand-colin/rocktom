import { Engine, Resource } from "@niloc/ecs";
import { demo } from "../levels/demo";
import { liz } from "../levels/liz";
import { timeIsRunningOut } from "../levels/timeIsRunningOut";
import { Level } from "../sound/Level";

export class LevelStorage extends Resource {

    private _levels: Level[] = []

    static storagePrefix = "Level_"

    static hardCodedLevels: Level[] = [
        liz(),
        timeIsRunningOut(),
        demo()
    ]

    constructor(engine: Engine) {
        super(engine)
        this.load()
    }

    get levels() {
        return this._levels
    }

    load() {
        this._levels = [...LevelStorage.hardCodedLevels]

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (!key || !key.startsWith(LevelStorage.storagePrefix))
                continue

            const data = localStorage.getItem(key)
            if (!data)
                continue

            try {
                const parsed = JSON.parse(data)
                const level = Level.deserialize(parsed)
                this._levels.push(level)
            } catch (e) {
                console.error("Failed to load level from storage:", e)
            }
        }

        this.changed()
    }

    get(id: string): Level | null {
        const level = this._levels.find(l => l.id === id)
        return level ?? null
    }

    save(level: Level) {
        const data = JSON.stringify(level.serialize())
        localStorage.setItem(LevelStorage.storagePrefix + level.id, data)
        const existing = this._levels.findIndex(l => l.id === level.id)

        if (existing === -1) {
            this._levels.push(level)
        } else {
            this._levels[existing] = level
        }

        this.changed()
    }

}
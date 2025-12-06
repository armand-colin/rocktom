import { Component, Engine } from "@niloc/ecs";
import type { String } from "../../sound/instrument/String";
import type { Pattern, TimedPattern } from "../../sound/song/Pattern";
import { TimeTransform } from "./TimeTransform";

export class PatternEditor extends Component {

    readonly pattern: Pattern
    readonly transform: TimeTransform

    private _string: String

    constructor(engine: Engine, pattern: TimedPattern) {
        super(engine)
        this.pattern = pattern.pattern
        this.transform = engine.createComponent(TimeTransform)
        this.transform.setHardOffset(pattern.time)

        this._string = this.pattern.instrument.strings[0]
    }

    get string() {
        return this._string
    }

    setString(string: String) {
        this._string = string
        this.changed()
    }

    removeNote(noteId: string) {
        if (this.pattern.remove(noteId))
            this.changed()
    }

}
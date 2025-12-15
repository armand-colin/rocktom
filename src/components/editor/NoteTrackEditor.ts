import { Component, Engine } from "@niloc/ecs";
import type { NoteTrack } from "../../sound/song/NoteTrack";
import { Pattern, TimedPattern } from "../../sound/song/Pattern";
import { Tempo } from "../../sound/Tempo";
import type { VirtualBass } from "../VirtualBass";

export class NoteTrackEditor extends Component {

    readonly track: NoteTrack
    readonly virtualBass: VirtualBass

    private _pattern: Pattern | null
    private _lastDuration: number = 0

    private _patterns: Pattern[] = []

    constructor(engine: Engine, track: NoteTrack, virtualBass: VirtualBass) {
        super(engine)
        this.track = track
        this.virtualBass = virtualBass

        this._patterns = Array.from(track.patterns.values())
        this._pattern = this._patterns[0] || null
    }

    get pattern() {
        return this._pattern
    }

    get patterns() {
        return Array.from(this.track.patterns.values())
    }

    setPattern(pattern: Pattern) {
        this._pattern = pattern
        this.changed()
    }

    createPattern(): Pattern {
        const pattern = new Pattern({
            name: "New Pattern",
            instrument: this.track.instrument,
            notes: [],
        })

        this.track.patterns.set(pattern.id, pattern)
        this._pattern = pattern
        this._patterns.push(pattern)
        this.changed()

        return pattern
    }

    selectTimedPattern(timedPattern: TimedPattern) {
        this._pattern = timedPattern.pattern
        this._lastDuration = timedPattern.duration
        this.changed()
    }

    selectPattern(pattern: Pattern) {
        this._pattern = pattern
        this._lastDuration = 0
        this.changed()
    }
    
    addTimedPattern(ticks: number) {
        if (!this._pattern)
            return

        let duration = this._pattern.duration
        if (this._pattern.duration === 0)
            duration = Tempo.bars(1)

        this.track.addTimedPattern(new TimedPattern({
            time: ticks,
            pattern: this._pattern,
            duration: this._lastDuration || duration,
        }))

        this.changed()
    }

    removeTimedPattern(id: string) {
        if (this.track.removeTimedPattern(id))
            this.changed()
    }

    setTimedPatternDuration(id: string, duration: number) {
        for (const tp of this.track.timedPatterns) {
            if (tp.id !== id)
                continue
            tp.duration = duration
            this._pattern = tp.pattern
            this._lastDuration = duration
            this.changed()
            return
        }
    }

    setTimedPatternTime(id: string, time: number) {
        for (const tp of this.track.timedPatterns) {
            if (tp.id !== id)
                continue
            tp.time = time
            this._pattern = tp.pattern
            this._lastDuration = tp.duration
            this.changed()
            return
        }
    }

}
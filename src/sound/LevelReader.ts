import type { Level } from "./Level";
import type { NoteEvent } from "./song/Pattern";
import type { Timing } from "./timing/Timing";

export class LevelReader {

    level: Level

    currentTiming: Timing

    _ticks: number = 0
    _bassIndex = 0

    constructor(level: Level) {
        this.level = level
        this.currentTiming = level.timing
    }

    *update(deltaTime: number): IterableIterator<NoteEvent> {
        const deltaTicks = this.currentTiming.ticksFromSeconds(deltaTime)
        const endTicks = this._ticks + deltaTicks

        while (
            this._bassIndex < this.level.bassTrack.notes.length &&
            this.level.bassTrack.notes[this._bassIndex].time <= endTicks
        ) {
            const note = this.level.bassTrack.notes[this._bassIndex]
            this._bassIndex++
            yield note
        }

        this._ticks = endTicks
    }

    reset() {
        this._ticks = 0
        this._bassIndex = 0
        this.currentTiming = this.level.timing
    }

}
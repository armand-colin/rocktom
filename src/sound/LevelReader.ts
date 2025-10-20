import type { Level } from "./Level";
import type { NoteEvent } from "./song/Pattern";
import type { Tempo } from "./Tempo";
import type { Timing } from "./timing/Timing";

export class LevelReader {

    level: Level

    currentTiming: Timing
    time: number = 0

    _bassIndex = 0
    _tempoIndex = 0

    constructor(level: Level) {
        this.level = level
        this.currentTiming = level.timing
    }

    *updateAudio(deltaTime: number): Iterator<AudioBuffer> {
        const deltaTicks = this.currentTiming.seconds(deltaTime)

        if (this.level.audioTrack.startTime > this.time && this.level.audioTrack.startTime <= this.time + deltaTicks) {
            yield this.level.audioTrack.audioBuffer
        }
    }

    *updateBass(deltaTime: number): Iterator<NoteEvent> {
        const deltaTicks = this.currentTiming.seconds(deltaTime)

        const bassTrack = this.level.bassTrack

        for (; this._bassIndex < bassTrack.notes.length; this._bassIndex++) {
            const note = bassTrack.notes[this._bassIndex]

            if (note.time > this.time + deltaTicks)
                break

            yield bassTrack.notes[this._bassIndex]
        }
    }

    *updateTempo(deltaTime: number): Iterator<Tempo> {
        const deltaTicks = this.currentTiming.seconds(deltaTime)
        const tempoTrack = this.level.tempoTrack

        for (; this._tempoIndex < tempoTrack.events.length; this._tempoIndex++) {
            const tempo = tempoTrack.events[this._tempoIndex]

            if (tempo.time > this.time + deltaTicks)
                break

            yield tempo.tempo
        }
    }


}
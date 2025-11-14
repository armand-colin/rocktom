import type { LinearizedTrack } from "./LinearizedTrack";
import type { AudioTrack } from "./song/AudioTrack";
import type { FocusTrack } from "./song/FocusTrack";
import type { TempoTrack } from "./song/TempoTrack";
import type { Timing } from "./timing/Timing";

export class Level {

    timing: Timing

    readonly bassTrack: LinearizedTrack
    readonly audioTrack: AudioTrack
    readonly tempoTrack: TempoTrack
    readonly focusTrack: FocusTrack

    constructor(
        readonly name: string,
        readonly author: string,
        timing: Timing,
        tracks: {
            bass: LinearizedTrack,
            audio: AudioTrack,
            tempo: TempoTrack,
            focus: FocusTrack
        }
    ) {
        this.timing = timing

        this.bassTrack = tracks.bass
        this.audioTrack = tracks.audio
        this.tempoTrack = tracks.tempo
        this.focusTrack = tracks.focus
    }

    get durationInSeconds(): number {
        const lastNote = this.bassTrack.notes[this.bassTrack.notes.length - 1]
        return this.timing.secondsFromTicks(lastNote.time + lastNote.duration)
    }

}
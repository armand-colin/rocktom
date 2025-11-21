import type { LinearizedTrack } from "./LinearizedTrack";
import type { AudioTrack } from "./song/AudioTrack";
import type { FocusTrack } from "./song/FocusTrack";
import type { TempoTrack } from "./song/TempoTrack";

export class Level {

    readonly bassTrack: LinearizedTrack
    readonly audioTrack: AudioTrack
    readonly tempoTrack: TempoTrack
    readonly focusTrack: FocusTrack

    constructor(
        readonly name: string,
        readonly author: string,
        tracks: {
            bass: LinearizedTrack,
            audio: AudioTrack,
            tempo: TempoTrack,
            focus: FocusTrack
        }
    ) {
        this.bassTrack = tracks.bass
        this.audioTrack = tracks.audio
        this.tempoTrack = tracks.tempo
        this.focusTrack = tracks.focus
    }

    get durationInSeconds(): number {
        const lastNote = this.bassTrack.notes[this.bassTrack.notes.length - 1]
        if (!lastNote)
            return 0
        
        return this.tempoTrack.secondsFromTicks(lastNote.time + lastNote.duration)
    }

}
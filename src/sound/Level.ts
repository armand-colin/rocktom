import type { AudioTrack } from "./song/AudioTrack";
import type { FocusTrack } from "./song/FocusTrack";
import type { TempoTrack } from "./song/TempoTrack";
import type { Track } from "./song/Track";

export class Level {

    readonly id: string
    readonly bassTrack: Track
    readonly audioTrack: AudioTrack
    readonly tempoTrack: TempoTrack
    readonly focusTrack: FocusTrack

    constructor(
        id: string,
        readonly name: string,
        readonly author: string,
        tracks: {
            bass: Track,
            audio: AudioTrack,
            tempo: TempoTrack,
            focus: FocusTrack
        }
    ) {
        this.id = id
        this.bassTrack = tracks.bass
        this.audioTrack = tracks.audio
        this.tempoTrack = tracks.tempo
        this.focusTrack = tracks.focus
    }

    get durationInTicks() {
        const lastNote = this.bassTrack.lastNote
        if (!lastNote)
            return 0

        return lastNote.time + lastNote.duration
    }

    get durationInSeconds(): number {
        return this.tempoTrack.secondsFromTicks(this.durationInTicks)
    }

}
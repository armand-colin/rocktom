import type { AudioTrack } from "./AudioTrack";
import type { LinearizedTrack } from "./LinearizedTrack";
import type { TempoTrack } from "./TempoTrack";
import type { Timing } from "./timing/Timing";

export class Level {

    timing: Timing

    bassTrack: LinearizedTrack
    audioTrack: AudioTrack
    tempoTrack: TempoTrack

    constructor(
        readonly name: string,
        timing: Timing,
        tracks: {
            bass: LinearizedTrack,
            audio: AudioTrack,
            tempo: TempoTrack
        }
    ) {
        this.timing = timing

        this.bassTrack = tracks.bass
        this.audioTrack = tracks.audio
        this.tempoTrack = tracks.tempo
    }

}
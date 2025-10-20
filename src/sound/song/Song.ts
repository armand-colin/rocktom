import type { Timing } from "../timing/Timing"
import type { Track } from "./Track"

enum SongEventType {
    
}

export class Song {

    readonly name: string
    readonly timing: Timing
    readonly audioBuffer: AudioBuffer
    readonly tracks: Track[]
    readonly events: SongEvent[]

    constructor(
        name: string, 
        timing: Timing, 
        tracks: Track[],
        events: SongEvent[]
    ) {
        this.tracks = tracks
        this.timing = timing
        this.name = name
    }

}
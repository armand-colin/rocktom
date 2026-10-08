import type { InstrumentTrack } from "../sound/song/InstrumentTrack"

export interface PlaybackRenderer {
    setTrack(track: InstrumentTrack): void
    /** @param discontinuous Seek/reset — snap visuals without firing in-between note starts. */
    sync(ticks: number, seconds: number, discontinuous?: boolean): void
    destroy(): void
}

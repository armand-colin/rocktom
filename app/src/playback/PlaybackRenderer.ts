import type { Instrument } from "../sound/instrument/Instrument"
import type { FocusTrack } from "../sound/song/FocusTrack"
import type { NoteEvent } from "../sound/song/NoteEvent"
import type { TempoTrack } from "../sound/song/TempoTrack"

export interface PlaybackRenderer {
    readonly element: HTMLElement
    setTrack(params: PlaybackRenderer.TrackParams): void
    /** @param discontinuous Seek/reset — snap visuals without firing in-between note starts. */
    sync(ticks: number, seconds: number, discontinuous?: boolean): void
    destroy(): void
}

export namespace PlaybackRenderer {
    export type TrackParams = {
        instrument: Instrument
        notes: NoteEvent[]
        focusTrack: FocusTrack
        tempoTrack: TempoTrack
    }
}

import { Chord } from "../sound/note/Chord"
import type { NoteEvent } from "../sound/song/NoteEvent"
import type { PlaybackRenderer } from "./PlaybackRenderer"
import "./PlaybackTabRenderer.scss"
import type { InstrumentTrack } from "../sound/song/InstrumentTrack"
import { Component, Engine } from "@niloc/ecs"
import type { Level } from "../sound/Level"

export interface ChordEvent {
    ticks: number,
    chord: Chord,
    duration: number,
}

export class PlaybackTabRenderer extends Component implements PlaybackRenderer {

    readonly level: Level

    private readonly _element: HTMLDivElement
    private readonly _timeline: HTMLDivElement

    private _chordEvents: ChordEvent[] = []

    constructor(engine: Engine, level: Level) {
        super(engine)

        this.level = level

        this._element = document.createElement("div")
        this._element.className = "PlaybackTabRenderer"

        this._timeline = document.createElement("div")
        this._timeline.className = "timeline"
        this._element.appendChild(this._timeline)
    }

    get element() {
        return this._element
    }

    get chordEvents() {
        return this._chordEvents
    }

    get maxTicks() {
        return this._chordEvents.reduce((max, event) => Math.max(max, event.ticks + event.duration), 0)
    }

    setTrack(track: InstrumentTrack): void {
        this._timeline.replaceChildren()

        this._chordEvents = this._collapseChords([...track.noteTrack.notes()])
        this.changed()
    }

    sync(_ticks: number, _seconds: number, _discontinuous?: boolean): void {
        // Static display for now — no playhead / scrolling.
    }

    destroy(): void {
        // Nothing for now
    }

    private _collapseChords(notes: NoteEvent[]): ChordEvent[] {
        const sorted = [...notes].sort((a, b) => a.time - b.time)
        const result: ChordEvent[] = []

        for (const note of sorted) {
            if (note.chord === null)
                continue

            const last = result[result.length - 1]
            if (last && Chord.equals(last.chord, note.chord))
                continue

            result.push({ 
                ticks: note.time, 
                chord: note.chord,
                duration: note.duration,
            })
        }

        return result
    }

}

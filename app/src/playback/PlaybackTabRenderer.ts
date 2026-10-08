import { Chord } from "../sound/note/Chord"
import { Tempo } from "../sound/Tempo"
import type { NoteEvent } from "../sound/song/NoteEvent"
import type { PlaybackRenderer } from "./PlaybackRenderer"
import "./PlaybackTabRenderer.scss"

export class PlaybackTabRenderer implements PlaybackRenderer {

    private readonly _element: HTMLDivElement
    private readonly _timeline: HTMLDivElement

    constructor() {
        this._element = document.createElement("div")
        this._element.className = "PlaybackTabRenderer"

        this._timeline = document.createElement("div")
        this._timeline.className = "timeline"
        this._element.appendChild(this._timeline)
    }

    get element() {
        return this._element
    }

    setTrack(params: PlaybackRenderer.TrackParams): void {
        this._timeline.replaceChildren()

        for (const entry of this._collapseChords(params.notes)) {
            const item = document.createElement("div")
            item.className = "chord"

            const bar = Math.floor(entry.time / Tempo.bars(1)) + 1
            const beat = Math.floor((entry.time % Tempo.bars(1)) / Tempo.PPQ) + 1

            const position = document.createElement("span")
            position.className = "position"
            position.textContent = `${bar}.${beat}`

            const label = document.createElement("span")
            label.className = "label"
            label.textContent = entry.chord.getLabel()

            item.append(position, label)
            this._timeline.appendChild(item)
        }
    }

    sync(_ticks: number, _seconds: number, _discontinuous?: boolean): void {
        // Static display for now — no playhead / scrolling.
    }

    destroy(): void {
        this._timeline.replaceChildren()
    }

    private _collapseChords(notes: NoteEvent[]): { time: number, chord: Chord }[] {
        const sorted = [...notes].sort((a, b) => a.time - b.time)
        const result: { time: number, chord: Chord }[] = []

        for (const note of sorted) {
            if (note.chord === null)
                continue

            const last = result[result.length - 1]
            if (last && Chord.equals(last.chord, note.chord))
                continue

            result.push({ time: note.time, chord: note.chord })
        }

        return result
    }

}

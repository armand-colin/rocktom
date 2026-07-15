import { Component, type Engine } from "@niloc/ecs";
import { Emitter, type Vec2 } from "@niloc/utils";
import type { NoteEvent } from "../../sound/song/NoteEvent";
import type { NoteTransform } from "./NoteTransform";
import type { TimeTransform } from "./TimeTransform";
import type { Selection } from "../Selection";

export class SelectionWindow extends Component {

    readonly events = new Emitter<{ end: void }>()

    readonly start: Vec2
    private _end: Vec2

    private _notes: NoteEvent[]
    private _timeTransform: TimeTransform
    private _noteTransform: NoteTransform
    private _selection: Selection<NoteEvent>
    private _container: HTMLElement

    constructor(engine: Engine, options: {
        notes: NoteEvent[],
        event: MouseEvent,
        container: HTMLElement,
        timeTransform: TimeTransform,
        noteTransform: NoteTransform,
        selection: Selection<NoteEvent>,
    }) {
        super(engine)
        const bounds = options.container.getBoundingClientRect()
        this._container = options.container

        options.event.preventDefault()

        this.start = {
            x: options.event.clientX - bounds.left,
            y: options.event.clientY - bounds.top
        }

        this._end = this.start

        this._notes = options.notes
        this._timeTransform = options.timeTransform
        this._noteTransform = options.noteTransform
        this._selection = options.selection

        window.addEventListener('mousemove', this._onMouseMove)
        window.addEventListener('mouseup', this._onMouseUp)
    }

    get end() {
        return this._end
    }

    setEnd(end: Vec2) {
        this._end = end
        this._update()
    }

    private _onMouseMove = (e: MouseEvent) => {
        e.preventDefault()

        this._end = {
            x: e.clientX - this._container.getBoundingClientRect().left,
            y: e.clientY - this._container.getBoundingClientRect().top
        }

        this._update()
    }

    private _onMouseUp = (e: MouseEvent) => {
        e.preventDefault()
        this.events.emit('end')
        this.destroy()
    }

    private _update() {
        const startTicks = this._timeTransform.getTicksForOffset(this.start.x)
        const endTicks = this._timeTransform.getTicksForOffset(this._end.x)
        const startNote = this._noteTransform.getNoteForOffset(this.start.y)
        const endNote = this._noteTransform.getNoteForOffset(this._end.y)

        console.log({
            startTicks,
            endTicks,
            startNote,
            endNote,
        })
        
        const notes = []
        for (const note of this._notes) {
            // Check if note is within the selection
            if (note.time > endTicks || note.time < startTicks)
                continue

            // Check if note is within the note range
            const noteIndex = note.string.note.index + note.fret

            if (
                noteIndex < startNote.index || 
                noteIndex > endNote.index
            )
                continue

            notes.push(note)
        }

        this._selection.set(notes)
        this.changed()
    }

    destroy(): void {
        super.destroy()

        this.events.removeAllListeners()
        window.removeEventListener('mousemove', this._onMouseMove)
        window.removeEventListener('mouseup', this._onMouseUp)
    }

}
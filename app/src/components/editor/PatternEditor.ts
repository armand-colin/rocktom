import { Component, Engine } from "@niloc/ecs";
import type { String } from "../../sound/instrument/String";
import { NoteEvent } from "../../sound/song/NoteEvent";
import type { Pattern, TimedPattern } from "../../sound/song/Pattern";
import { Tempo } from "../../sound/Tempo";
import { Selection } from "../Selection";
import type { VirtualBass } from "../VirtualBass";
import { TimeTransform } from "./TimeTransform";
import { NoteTransform } from "./NoteTransform";
import type { Note } from "../../sound/note/Note";
import { Rules } from "../../3d/Rules";
import { SelectionWindow } from "./SelectionWindow";

export class PatternEditor extends Component {

    readonly pattern: Pattern
    readonly transform: TimeTransform
    readonly noteTransform: NoteTransform
    readonly virtualBass: VirtualBass
    readonly selection: Selection<NoteEvent>

    private _selectionWindow: SelectionWindow | null = null

    private _string: String
    private _setDuration: number = Tempo.beats(1)

    constructor(engine: Engine, pattern: TimedPattern, virtualBass: VirtualBass) {
        super(engine)
        this.pattern = pattern.pattern
        this.virtualBass = virtualBass
        this.transform = engine.createComponent(TimeTransform)
        this.transform.setHardOffset(pattern.time)
        this.transform.setStep(Tempo.beats(1 / 4))

        this.noteTransform = engine.createComponent(NoteTransform, this.pattern.instrument)
        this.selection = engine.createComponent<Selection<NoteEvent>, []>(Selection)
        this._string = this.pattern.instrument.strings[0]
    }

    get string() {
        return this._string
    }

    get selectionWindow() {
        return this._selectionWindow
    }

    setName(name: string) {
        this.pattern.name = name
        this.changed()
    }

    setString(string: String) {
        this._string = string
        this.changed()
    }

    removeNote(noteId: string) {
        if (this.pattern.remove(noteId)) {
            this.selection.removeById(noteId)
            this.changed()
        }
    }

    selectNote(id: string) {
        const note = this.pattern.notes.find(n => n.id === id)
        if (!note)
            return

        this._string = note.string
        this._setDuration = note.duration
        this.selection.set([note])
        this.changed()
    }

    setNoteDuration(id: string, duration: number) {
        const note = this.pattern.notes.find(n => n.id === id)
        if (!note)
            return

        note.duration = duration
        this._string = note.string
        this._setDuration = note.duration
        this.changed()
    }

    setNoteTime(id: string, time: number) {
        const note = this.pattern.notes.find(n => n.id === id)
        if (!note)
            return

        note.time = time
        this._string = note.string
        this.changed()
    }

    setNoteNote(id: string, note: Note) {
        const noteEvent = this.pattern.notes.find(n => n.id === id)
        if (!noteEvent)
            return

        const fret = note.index - noteEvent.string.note.index
        if (fret < 0 || fret > Rules.maxFret)
            return

        noteEvent.fret = fret
        this._string = noteEvent.string
        this.changed()
    }

    addNote(string: String, fret: number, ticks: number) {
        const note = NoteEvent.create({
            duration: this._setDuration,
            fret: fret,
            string: string,
            time: ticks,
            fingerPosition: undefined,
        })

        this.pattern.add(note)
        this.changed()

        return note;
    }

    setNoteString(id: string, string: String) {
        const note = this.pattern.notes.find(n => n.id === id)
        if (!note)
            return

        const targetNote = note.string.fret(note.fret)
        const newFret = targetNote.index - string.note.index

        note.string = string
        note.fret = newFret
        this._string = string
        this._setDuration = note.duration
        this.changed()
    }

    startSelectionWindow(e: MouseEvent, container: HTMLElement) {
        if (this._selectionWindow)
            return

        const selectionWindow = new SelectionWindow(this.engine, {
            notes: this.pattern.notes,
            event: e,
            container: container,
            timeTransform: this.transform,
            noteTransform: this.noteTransform,
            selection: this.selection
        })

        this._selectionWindow = selectionWindow

        selectionWindow.events.on('end', () => {
            if (this._selectionWindow !== selectionWindow)
                return

            selectionWindow.destroy()
            this._selectionWindow = null;
            this.changed();
        })

        this.changed()
    }

}
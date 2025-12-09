import { Component, Engine } from "@niloc/ecs";
import type { String } from "../../sound/instrument/String";
import { NoteEvent } from "../../sound/song/NoteEvent";
import type { Pattern, TimedPattern } from "../../sound/song/Pattern";
import { Tempo } from "../../sound/Tempo";
import { Selection } from "../Selection";
import type { VirtualBass } from "../VirtualBass";
import { TimeTransform } from "./TimeTransform";

export class PatternEditor extends Component {

    readonly pattern: Pattern
    readonly transform: TimeTransform
    readonly virtualBass: VirtualBass
    readonly selection: Selection<NoteEvent>

    private _string: String
    private _setDuration: number = Tempo.beats(1)

    constructor(engine: Engine, pattern: TimedPattern, virtualBass: VirtualBass) {
        super(engine)
        this.pattern = pattern.pattern
        this.virtualBass = virtualBass
        this.transform = engine.createComponent(TimeTransform)
        this.transform.setHardOffset(pattern.time)
        this.selection = engine.createComponent<Selection<NoteEvent>, []>(Selection)
        this._string = this.pattern.instrument.strings[0]
    }

    get string() {
        return this._string
    }

    setString(string: String) {
        this._string = string
        this.changed()
    }

    removeNote(noteId: string) {
        if (this.pattern.remove(noteId))
            this.changed()
    }

    setNoteDuration(id: string, duration: number) {
        const note = this.pattern.notes.find(n => n.id === id)
        if (!note)
            return

        note.duration = duration
        this._setDuration = note.duration
        this.changed()
    }

    setNoteTime(id: string, time: number) {
        const note = this.pattern.notes.find(n => n.id === id)
        if (!note)
            return

        note.time = time
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
    }

    setNoteString(id: string, string: String) {
        const note = this.pattern.notes.find(n => n.id === id)
        if (!note)
            return

        console.log("Moving note", note.string.name, note.fret)
        const targetNote = note.string.fret(note.fret)
        const newFret = targetNote.index - string.note.index
        console.log("To", string.name, newFret)

        note.string = string
        note.fret = newFret
        this.changed()
    }

}
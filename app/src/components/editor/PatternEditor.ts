import { Component, Engine } from "@niloc/ecs";
import type { String } from "../../sound/instrument/String";
import { NoteEvent, type NoteSlide } from "../../sound/song/NoteEvent";
import type { Pattern, TimedPattern } from "../../sound/song/Pattern";
import { Tempo } from "../../sound/Tempo";
import { Selection } from "../Selection";
import type { VirtualBass } from "../VirtualBass";
import { TimeTransform } from "./TimeTransform";
import { NoteTransform } from "./NoteTransform";
import type { Note } from "../../sound/note/Note";
import { Rules } from "../../3d/Rules";
import { SelectionWindow } from "./SelectionWindow";
import { Clipboard } from "../../resources/clipboard/Clipboard";
import { ClipboardEntryKind } from "../../resources/clipboard/ClipboardEntryKind";
import { MouseDispatcher } from "../../mouse/MouseDispatcher";
import type { MouseEventDispatcher } from "../../mouse/MouseEventDispatcher";
import { PatternCycleStringMouseDispatcher } from "./actions/PatternCycleStringMouseDispatcher";
import { PatternGridMouseDispatcher } from "./actions/PatternGridMouseDispatcher";
import { PatternKeyboardMouseDispatcher } from "./actions/PatternKeyboardMouseDispatcher";
import { PatternNoteMouseDispatcher } from "./actions/PatternNoteMouseDispatcher";

export class PatternEditor extends Component {

    readonly pattern: Pattern
    readonly transform: TimeTransform
    readonly noteTransform: NoteTransform
    readonly virtualBass: VirtualBass
    readonly selection: Selection<NoteEvent>

    private _selectionWindow: SelectionWindow | null = null
    private _mouseDispatchers: MouseEventDispatcher[] = []

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

        const mouse = engine.getResource(MouseDispatcher)
        this._mouseDispatchers = [
            new PatternNoteMouseDispatcher(this),
            new PatternKeyboardMouseDispatcher(this),
            new PatternCycleStringMouseDispatcher(this),
            new PatternGridMouseDispatcher(this),
        ]
        for (const dispatcher of this._mouseDispatchers)
            mouse.push(dispatcher)

        this.selection.onChange(this._onSelectionChanged)
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

    removeSelection(): boolean {
        const selection = [...this.selection.elements]
        if (selection.length === 0)
            return false

        for (const note of selection)
            this.pattern.remove(note.id)

        this.selection.clear()
        this.changed()
        return true
    }

    selectNote(id: string) {
        const note = this.pattern.notes.find(n => n.id === id)
        if (!note)
            return

        this.selection.set([note])
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

    setNoteSlide(id: string, slide: NoteSlide | null) {
        const note = this.pattern.notes.find(n => n.id === id)
        if (!note)
            return

        note.slide = slide
        this._string = note.string
        this._setDuration = note.duration
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

        this.selection.set([note])

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

    cycleNoteString(id: string, direction: 1 | -1) {
        const note = this.pattern.notes.find(n => n.id === id)
        if (!note)
            return

        const pitch = note.string.fret(note.fret)
        const strings = this.pattern.instrument.strings
        const count = strings.length

        for (let i = 1; i < count; i++) {
            const index = ((note.string.index + direction * i) % count + count) % count
            const newString = strings[index]
            if (newString.canPlay(pitch)) {
                this.setNoteString(id, newString)
                return
            }
        }
    }

    cycleSelectionString(direction: 1 | -1) {
        const selection = [...this.selection.elements]
        if (selection.length === 0)
            return

        for (const note of selection)
            this.cycleNoteString(note.id, direction)
    }

    copySelectionToClipboard(): boolean {
        const selection = [...this.selection.elements]
        if (selection.length === 0)
            return false

        selection.sort((a, b) => a.time - b.time)

        const clipboard = this.engine.getResource(Clipboard)
        clipboard.set({
            kind: ClipboardEntryKind.PatternNoteEvents,
            payload: selection.map(note => NoteEvent.clone(note))
        })

        return true
    }

    pasteFromClipboard(anchorTime: number): boolean {
        const clipboard = this.engine.getResource(Clipboard)
        const entry = clipboard.read(ClipboardEntryKind.PatternNoteEvents)
        if (!entry || entry.payload.length === 0)
            return false

        const sourceNotes = [...entry.payload].sort((a, b) => a.time - b.time)
        const minTime = sourceNotes[0].time
        const offset = anchorTime - minTime

        const pastedNotes: NoteEvent[] = []
        for (const sourceNote of sourceNotes) {
            const note = NoteEvent.clone(sourceNote)
            note.time = Math.max(0, note.time + offset)

            this.pattern.add(note)
            pastedNotes.push(note)
        }

        if (pastedNotes.length > 0) {
            this.selection.set(pastedNotes)
        } else
            this.changed()
        return true
    }

    pasteFromClipboardAtGlobalTime(globalTime: number): boolean {
        const anchorTime = globalTime - this.transform.hardOffset
        return this.pasteFromClipboard(anchorTime)
    }

    duplicateSelection(): boolean {
        const selection = [...this.selection.elements]
        if (selection.length === 0)
            return false

        let minTime = Infinity
        let endTime = -Infinity
        for (const note of selection) {
            minTime = Math.min(minTime, note.time)
            endTime = Math.max(endTime, note.time + note.duration)
        }

        const offset = endTime - minTime
        const duplicatedNotes: NoteEvent[] = []
        for (const sourceNote of selection) {
            const note = NoteEvent.clone(sourceNote)
            note.time = sourceNote.time + offset
            this.pattern.add(note)
            duplicatedNotes.push(note)
        }

        this.selection.set(duplicatedNotes)
        return true
    }

    setSelectionWindow(selectionWindow: SelectionWindow | null) {
        this._selectionWindow = selectionWindow
        this.changed()
    }

    private _onSelectionChanged = () => {
        const lastNote = this.selection.elements[this.selection.elements.length - 1]

        if (lastNote) {
            this._string = lastNote.string
            this.changed()
        }
    }

    destroy(): void {
        const mouse = this.engine.getResource(MouseDispatcher)
        for (const dispatcher of this._mouseDispatchers)
            mouse.remove(dispatcher)
        this._mouseDispatchers = []
        this._selectionWindow?.destroy()
        this._selectionWindow = null
        super.destroy()
        this.selection.offChange(this._onSelectionChanged)
    }

    triggerChanged() {
        this.changed()
    }

}
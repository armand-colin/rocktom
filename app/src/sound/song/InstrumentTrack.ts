import { Instrument } from "../instrument/Instrument"
import { Tempo } from "../Tempo"
import { Focus } from "./Focus"
import { FocusTrack, FocusTrackBuilder, type SerializedFocusTrack } from "./FocusTrack"
import { NoteTrack, NoteTrackBuilder, type SerializedNoteTrack } from "./NoteTrack"
import type { Pattern } from "./Pattern"
import type { TempoTrack } from "./TempoTrack"

export type SerializedInstrumentTrack = {
    note: SerializedNoteTrack
    focus: SerializedFocusTrack
}

export class InstrumentTrack {

    readonly noteTrack: NoteTrack
    readonly focusTrack: FocusTrack

    constructor(opts: {
        noteTrack: NoteTrack
        focusTrack: FocusTrack
    }) {
        this.noteTrack = opts.noteTrack
        this.focusTrack = opts.focusTrack
    }

    get id() {
        return this.noteTrack.id
    }

    get name() {
        return this.noteTrack.name
    }

    set name(value: string) {
        this.noteTrack.name = value
    }

    get instrument() {
        return this.noteTrack.instrument
    }

    setInstrument(instrument: Instrument) {
        this.noteTrack.setInstrument(instrument)
    }

    clone(): InstrumentTrack {
        return new InstrumentTrack({
            noteTrack: this.noteTrack.clone(),
            focusTrack: this.focusTrack.clone(),
        })
    }

    serialize(): SerializedInstrumentTrack {
        return {
            note: this.noteTrack.serialize(),
            focus: this.focusTrack.serialize(),
        }
    }

    static deserialize(data: SerializedInstrumentTrack): InstrumentTrack {
        return new InstrumentTrack({
            noteTrack: NoteTrack.deserialize(data.note),
            focusTrack: FocusTrack.deserialize(data.focus),
        })
    }

    static default(instrument: Instrument = Instrument.BassStandard): InstrumentTrack {
        return new InstrumentTrack({
            noteTrack: new NoteTrack({
                instrument,
                timedPatterns: [],
                markers: [],
            }),
            focusTrack: new FocusTrack(Focus.default(), []),
        })
    }

}

export class InstrumentTrackBuilder {

    private _notes: NoteTrackBuilder
    private _focus: FocusTrackBuilder

    constructor(instrument: Instrument, initialFocus?: [number, number]) {
        this._notes = new NoteTrackBuilder(instrument)
        this._focus = new FocusTrackBuilder(initialFocus)
    }

    silence(ticks: number): this {
        this._notes.silence(ticks)
        return this
    }

    get time() {
        return this._notes.time
    }

    pattern(pattern: Pattern): this {
        this._notes.pattern(pattern)
        return this
    }

    marker(name: string): this {
        this._notes.marker(name)
        return this
    }

    addFocus(focus: [number, number], duration: number, forward: boolean = false): this {
        if (forward) {
            this._focus.add(this._notes.time, duration, focus)
        } else {
            this._focus.add(this._notes.time - duration, duration, focus)
        }

        return this
    }

    addTempo(tempo: Tempo, tempoTrack: TempoTrack): this {
        this._notes.addTempo(tempo, tempoTrack)
        return this
    }

    build(): InstrumentTrack {
        return new InstrumentTrack({
            noteTrack: this._notes.build(),
            focusTrack: this._focus.build(),
        })
    }

}

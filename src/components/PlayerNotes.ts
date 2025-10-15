import { Component } from "../engine/Component";
import type { MidiEvent } from "../sound/MidiEvent";
import type { MusicSheet } from "../sound/MusicSheet";

export class PlayerNotes extends Component {

    private _instrument: MidiEvent.InstrumentType
    private _notes: MusicSheet.NoteEvent[]

    constructor(
        notes: MusicSheet.NoteEvent[],
        instrument: MidiEvent.InstrumentType
    ) {
        super()
        this._instrument = instrument
        this._notes = notes
    }

}
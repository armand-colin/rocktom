import { Component, Engine } from "@niloc/ecs"
import type { InstrumentTrack } from "../../sound/song/InstrumentTrack"
import type { VirtualBass } from "../VirtualBass"
import { FocusTrackEditor } from "./FocusTrackEditor"
import { NoteTrackEditor } from "./NoteTrackEditor"
import type { Instrument } from "../../sound/instrument/Instrument"
import { EditorPreferences } from "../../resources/EditorPreferences"

export class InstrumentTrackEditor extends Component {

    readonly track: InstrumentTrack
    readonly noteTrack: NoteTrackEditor
    readonly focusTrack: FocusTrackEditor
    
    private _open: boolean

    constructor(engine: Engine, track: InstrumentTrack, virtualBass: VirtualBass) {
        super(engine)
        this.track = track
        this.noteTrack = engine.createComponent(NoteTrackEditor, track.noteTrack, virtualBass)
        this.focusTrack = engine.createComponent(FocusTrackEditor, track.focusTrack)
        this._open = engine.getResource(EditorPreferences).openInstrumentTracks[track.id] ?? true
    }

    get instrument() {
        return this.track.instrument
    }

    get open() {
        return this._open
    }

    setInstrument(instrument: Instrument) {
        this.track.setInstrument(instrument)
        this.changed()
    }

    setOpen(open: boolean) {
        this._open = open
        this.engine.getResource(EditorPreferences).setOpenInstrumentTrack(this.track.id, open)
        this.changed()
    }

    destroy() {
        this.noteTrack.destroy()
        this.focusTrack.destroy()
        super.destroy()
    }

}

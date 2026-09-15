import { Component, Engine } from "@niloc/ecs"
import { EditorPreferences } from "../../resources/EditorPreferences"
import { Mixer, MixerChannel } from "../../resources/Mixer"
import type { Instrument } from "../../sound/instrument/Instrument"
import type { InstrumentTrack } from "../../sound/song/InstrumentTrack"
import type { VirtualInstrument } from "../virtualInstrument/VirtualInstrument"
import { VirtualInstrumentFactory } from "../virtualInstrument/VirtualInstrumentFactory"
import { FocusTrackEditor } from "./FocusTrackEditor"
import { NoteTrackEditor } from "./NoteTrackEditor"

export class InstrumentTrackEditor extends Component {

    readonly track: InstrumentTrack
    readonly noteTrack: NoteTrackEditor
    readonly focusTrack: FocusTrackEditor

    virtualInstrument: VirtualInstrument

    private _channel: MixerChannel
    private _open: boolean

    constructor(engine: Engine, track: InstrumentTrack) {
        super(engine)
        this.track = track
        this.noteTrack = engine.createComponent(NoteTrackEditor, track.noteTrack)
        this.focusTrack = engine.createComponent(FocusTrackEditor, track.focusTrack)
        this._open = engine.getResource(EditorPreferences).openInstrumentTracks[track.id] ?? true

        const mixer = engine.getResource(Mixer)
        this._channel = engine.createComponent(
            MixerChannel,
            `instrumentTrack_${track.id}`,
            track.name,
        )
        mixer.virtualInstrument.connect(this._channel.node)
        this._channel.setEnabled(this._open)

        this.virtualInstrument = VirtualInstrumentFactory.create(
            engine,
            track.instrument,
            this._channel,
        )
    }

    get instrument() {
        return this.track.instrument
    }

    get open() {
        return this._open
    }

    setInstrument(instrument: Instrument) {
        this.track.setInstrument(instrument)
        this.virtualInstrument.destroy()
        this.virtualInstrument = VirtualInstrumentFactory.create(
            this.engine,
            instrument,
            this._channel,
        )
        this.changed()
    }

    setOpen(open: boolean) {
        this._open = open
        this.engine.getResource(EditorPreferences).setOpenInstrumentTrack(this.track.id, open)
        this._channel.setEnabled(open)
        if (!open)
            this.virtualInstrument.stopAll()
        this.changed()
    }

    destroy() {
        this.virtualInstrument.destroy()
        this._channel.destroy()
        this.noteTrack.destroy()
        this.focusTrack.destroy()
        super.destroy()
    }

}

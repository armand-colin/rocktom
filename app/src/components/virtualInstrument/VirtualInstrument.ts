import { Component, Engine } from "@niloc/ecs"
import type { MixerChannel } from "../../resources/Mixer"
import { SoundEngine } from "../../resources/SoundEngine"
import type { Instrument } from "../../sound/instrument/Instrument"
import type { String } from "../../sound/instrument/String"
import type { GainSoundNode } from "../../sound/node/GainSoundNode"
import type { OscillatorSoundNode } from "../../sound/node/OscillatorSoundNode"
import type { Note } from "../../sound/note/Note"

export interface VirtualInstrument {
    readonly instrument: Instrument

    playNote(note: Note, string: String): void
    stopNote(note: Note, string: String): void
    stopAll(): void

    destroy(): void
}

type Oscillator = {
    node: OscillatorSoundNode
    gain: GainSoundNode
    playing: boolean
    note: Note | null
}

export abstract class VirtualInstrumentBase extends Component implements VirtualInstrument {

    readonly instrument: Instrument

    protected _node: GainSoundNode
    protected _oscillators: Oscillator[]

    constructor(engine: Engine, instrument: Instrument, channel: MixerChannel) {
        super(engine)
        this.instrument = instrument

        const soundEngine = engine.getResource(SoundEngine)
        this._node = soundEngine.createGainNode()
        channel.connect(this._node)

        this._oscillators = instrument.strings.map(() => ({
            node: soundEngine.createOscillatorNode(),
            gain: soundEngine.createGainNode(),
            playing: false,
            note: null,
        }))

        for (const osc of this._oscillators) {
            osc.gain.gain = 0
            osc.node.connect(osc.gain)
            osc.gain.connect(this._node)
        }
    }

    playNote(note: Note, string: String): void {
        const osc = this._oscillators[string.index]
        if (!osc)
            return

        osc.node.frequency = note.frequency
        osc.gain.gain = 1.0
        osc.note = note
        osc.playing = true
    }

    stopNote(note: Note, string: String): void {
        const osc = this._oscillators[string.index]
        if (!osc)
            return

        if (osc.playing && osc.note?.index === note.index) {
            osc.gain.gain = 0.0
            osc.playing = false
            osc.note = null
        }
    }

    stopAll(): void {
        for (const osc of this._oscillators) {
            if (!osc.playing)
                continue
            osc.gain.gain = 0.0
            osc.playing = false
            osc.note = null
        }
    }

    destroy(): void {
        this.stopAll()
        super.destroy()
    }

}

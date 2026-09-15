import { Component, Engine } from "@niloc/ecs"
import type { MixerChannel } from "../../resources/Mixer"
import { SoundEngine } from "../../resources/SoundEngine"
import { Schedules } from "../../Schedules"
import { Adsr, type AdsrParams } from "../../sound/envelope/Adsr"
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
    envelope: Adsr | null
}

const DEFAULT_ADSR: AdsrParams = {
    attack: 0.008,
    decay: 0.12,
    sustain: 0.55,
    release: 0.14,
}

export type VoiceTimbre = {
    /** Harmonic amplitudes: index 0 = fundamental, 1 = 2nd harmonic, etc. */
    harmonics: readonly number[]
}

const DEFAULT_TIMBRE: VoiceTimbre = {
    harmonics: [1],
}

export abstract class VirtualInstrumentBase extends Component implements VirtualInstrument {

    readonly instrument: Instrument

    protected _node: GainSoundNode
    protected _oscillators: Oscillator[]
    private readonly _soundEngine: SoundEngine

    constructor(engine: Engine, instrument: Instrument, channel: MixerChannel) {
        super(engine)
        this.instrument = instrument

        this._soundEngine = engine.getResource(SoundEngine)
        this._node = this._soundEngine.createGainNode()
        channel.connect(this._node)

        const harmonics = this.voiceTimbre.harmonics

        this._oscillators = instrument.strings.map(() => ({
            node: this._soundEngine.createOscillatorNode(),
            gain: this._soundEngine.createGainNode(),
            playing: false,
            note: null,
            envelope: null,
        }))

        for (const osc of this._oscillators) {
            osc.gain.gain = 0
            osc.node.setHarmonics(harmonics)
            osc.node.connect(osc.gain)
            osc.gain.connect(this._node)
        }

        this.startCoroutine(this._updateEnvelopes())
    }

    protected get adsrParams(): AdsrParams {
        return DEFAULT_ADSR
    }

    protected get voiceTimbre(): VoiceTimbre {
        return DEFAULT_TIMBRE
    }

    playNote(note: Note, string: String): void {
        const osc = this._oscillators[string.index]
        if (!osc)
            return

        const now = this._soundEngine.currentTime
        osc.node.frequency = note.frequency
        osc.envelope = new Adsr(this.adsrParams)
        osc.envelope.noteOn(now)
        osc.envelope.setTime(now)
        osc.gain.setGainSmooth(osc.envelope.value)
        osc.note = note
        osc.playing = true
    }

    stopNote(note: Note, string: String): void {
        const osc = this._oscillators[string.index]
        if (!osc)
            return

        if (osc.envelope && osc.note?.index === note.index)
            osc.envelope.noteOff(this._soundEngine.currentTime)
    }

    stopAll(): void {
        const now = this._soundEngine.currentTime
        for (const osc of this._oscillators) {
            if (!osc.envelope)
                continue
            osc.envelope.noteOff(now)
        }
    }

    destroy(): void {
        this.stopAll()
        super.destroy()
    }

    private *_updateEnvelopes() {
        while (true) {
            const now = this._soundEngine.currentTime
            for (const osc of this._oscillators) {
                if (!osc.envelope)
                    continue

                osc.envelope.setTime(now)
                osc.gain.setGainSmooth(osc.envelope.value)

                if (osc.envelope.finished) {
                    osc.gain.setGainSmooth(0)
                    osc.envelope = null
                    osc.playing = false
                    osc.note = null
                }
            }
            yield Schedules.Frame
        }
    }

}

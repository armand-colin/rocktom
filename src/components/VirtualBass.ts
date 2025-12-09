import { Component, Engine } from "@niloc/ecs";
import { Mixer } from "../resources/Mixer";
import { SoundEngine } from "../resources/SoundEngine";
import { Bass } from "../sound/instrument/Instrument";
import type { GainSoundNode } from "../sound/node/GainSoundNode";
import type { OscillatorSoundNode } from "../sound/node/OscillatorSoundNode";
import type { Note } from "../sound/note/Note";

type Oscillator = {
    node: OscillatorSoundNode,
    gain: GainSoundNode,
    playing: boolean,
    note: Note | null
}

export class VirtualBass extends Component {

    private _instrument = new Bass()
    private _node: GainSoundNode

    private _oscillators: Oscillator[] = []

    constructor(engine: Engine) {
        super(engine)
        const soundEngine = engine.getResource(SoundEngine)
        this._node = soundEngine.createGainNode()

        const mixer = engine.getResource(Mixer)
        mixer.feedback.connect(this._node)

        this._oscillators = Array(this._instrument.strings.length)
            .fill(null)
            .map(() => ({
                node: soundEngine.createOscillatorNode(),
                gain: soundEngine.createGainNode(),
                playing: false,
                note: null
            }))

        for (const osc of this._oscillators) {
            osc.gain.gain = 0
            osc.node.connect(osc.gain)
            osc.gain.connect(this._node)
        }
    }

    private _getOscillator() {
        for (const osc of this._oscillators) {
            if (!osc.playing)
                return osc
        }

        return this._oscillators[0]
    }

    playNote(note: Note) {
        const oscillator = this._getOscillator()
        const frequency = note.frequency
        oscillator.node.frequency = frequency
        oscillator.gain.gain = 1.0
        oscillator.note = note
        oscillator.playing = true
    }

    stopNote(note: Note) {
        for (const oscillator of this._oscillators) {
            if (oscillator.playing && oscillator.note?.index === note.index) {
                oscillator.gain.gain = 0.0
                oscillator.playing = false
                oscillator.note = null
                break
            }
        }
    }

}
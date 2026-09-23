import { Engine } from "@niloc/ecs"
import type { MixerChannel } from "../../resources/Mixer"
import type { Instrument } from "../../sound/instrument/Instrument"
import { VirtualInstrumentBase, type VoiceTimbre } from "./VirtualInstrument"

const BASS_TIMBRE: VoiceTimbre = {
    // Fundamental slightly recessed vs H2–H3 for mid presence (less "muddy").
    harmonics: [0.65, 1.0, 0.7, 0.45, 0.28, 0.16, 0.09, 0.05],
}

export class VirtualBass extends VirtualInstrumentBase {

    constructor(engine: Engine, instrument: Instrument, channel: MixerChannel) {
        super(engine, instrument, channel)
    }

    protected override get voiceTimbre(): VoiceTimbre {
        return BASS_TIMBRE
    }

}

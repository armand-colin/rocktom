import { Engine } from "@niloc/ecs"
import type { MixerChannel } from "../../resources/Mixer"
import type { Instrument } from "../../sound/instrument/Instrument"
import { VirtualInstrumentBase } from "./VirtualInstrument"

export class VirtualBass extends VirtualInstrumentBase {

    constructor(engine: Engine, instrument: Instrument, channel: MixerChannel) {
        super(engine, instrument, channel)
    }

}

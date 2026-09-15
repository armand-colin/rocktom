import type { Engine } from "@niloc/ecs"
import type { MixerChannel } from "../../resources/Mixer"
import { InstrumentType, type Instrument } from "../../sound/instrument/Instrument"
import { VirtualBass } from "./VirtualBass"
import { VirtualGuitar } from "./VirtualGuitar"
import type { VirtualInstrument } from "./VirtualInstrument"

export namespace VirtualInstrumentFactory {

    export function create(
        engine: Engine,
        instrument: Instrument,
        channel: MixerChannel,
    ): VirtualInstrument {
        switch (instrument.type) {
            case InstrumentType.Bass:
                return engine.createComponent(VirtualBass, instrument, channel)
            case InstrumentType.Guitar:
                return engine.createComponent(VirtualGuitar, instrument, channel)
        }
    }

}

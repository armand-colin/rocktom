import { Note } from "../note/Note"
import { String } from "./String"

export enum InstrumentType {
    Bass = "bass"
}

export type Instrument = {
    type: InstrumentType,
    strings: String[],
    lowestString: String,
    highestString: String,
    name: string
}

export namespace Instrument {

    const bassStrings = [
        new String(0, 0 / 3, "E", Note.fromName("E", 1)),
        new String(1, 1 / 3, "A", Note.fromName("A", 1)),
        new String(2, 2 / 3, "D", Note.fromName("D", 2)),
        new String(3, 3 / 3, "G", Note.fromName("G", 2)),
    ]

    export const Bass: Instrument = {
        name: "Bass",
        type: InstrumentType.Bass,
        strings: bassStrings,
        lowestString: bassStrings[0],
        highestString: bassStrings[3],
    }

    export function fromType(type: InstrumentType): Instrument {
        switch (type) {
            case InstrumentType.Bass:
                return Bass
        }
        throw new Error(`Unknown instrument type: ${type}`)
    }

}

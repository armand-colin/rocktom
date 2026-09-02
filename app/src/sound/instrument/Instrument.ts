import { Note } from "../note/Note"
import { String } from "./String"

export enum InstrumentType {
    Bass = "bass"
}

function InstrumentTypeName(type: InstrumentType) {
    switch (type) {
        case InstrumentType.Bass:
            return "Bass"
    }
}

export enum InstrumentTuning {
    Standard = "standard",
    DropD = "drop-d",
}

function InstrumentTuningName(tuning: InstrumentTuning) {
    switch (tuning) {
        case InstrumentTuning.Standard:
            return "Standard"
        case InstrumentTuning.DropD:
            return "Drop D"
    }
}

export class Instrument {

    static BassStandard = new Instrument({
        type: InstrumentType.Bass,
        tuning: InstrumentTuning.Standard,
        strings: [
            new String(0, 0 / 3, "E", Note.fromName("E", 1)),
            new String(1, 1 / 3, "A", Note.fromName("A", 1)),
            new String(2, 2 / 3, "D", Note.fromName("D", 2)),
            new String(3, 3 / 3, "G", Note.fromName("G", 2)),
        ]
    })

    static BassDropD = new Instrument({
        type: InstrumentType.Bass,
        tuning: InstrumentTuning.DropD,
        strings: [
            new String(0, 0 / 3, "D", Note.fromName("D", 1)),
            new String(1, 1 / 3, "A", Note.fromName("A", 1)),
            new String(2, 2 / 3, "d", Note.fromName("D", 2)),
            new String(3, 3 / 3, "G", Note.fromName("G", 2)),
        ]
    })

    static deserialize(type: InstrumentType, tuning: InstrumentTuning): Instrument {
    
        switch (type) {
            case InstrumentType.Bass: {
                switch (tuning) {
                    case InstrumentTuning.Standard:
                        return Instrument.BassStandard;
                    case InstrumentTuning.DropD:
                        return Instrument.BassDropD;
                }
            }

            default:
                // Fallback for older songs
                return Instrument.BassStandard;
        }
    }

    readonly type: InstrumentType
    readonly tuning: InstrumentTuning
    readonly strings: String[]

    constructor(opts: {
        type: InstrumentType,
        tuning: InstrumentTuning,
        strings: String[]
    }) {
        this.type = opts.type
        this.tuning = opts.tuning
        this.strings = opts.strings
    }

    get id() {
        return this.type + "." + this.tuning
    }

    get lowestString() {
        return this.strings[0]
    }

    get highestString() {
        return this.strings[this.strings.length - 1]
    }

    get name() {
        return InstrumentTypeName(this.type) + " (" + InstrumentTuningName(this.tuning) + ")"
    }

}
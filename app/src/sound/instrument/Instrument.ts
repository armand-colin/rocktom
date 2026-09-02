import { Enum } from "../../utils/Enum"
import { Note } from "../note/Note"
import { String } from "./String"

export const InstrumentType = Enum.create({
    Bass: "bass",
    Guitar: "guitar",
} as const, {
    getLabel(type: InstrumentType) {
        switch (type) {
            case InstrumentType.Bass:
                return "Bass"
            case InstrumentType.Guitar:
                return "Guitar"
        }
    }
})

export type InstrumentType = Enum.Infer<typeof InstrumentType>

export const InstrumentTuning = Enum.create({
    Standard: "standard",
    DropD: "drop-d",
} as const, {
    getLabel(tuning: InstrumentTuning) {
        switch (tuning) {
            case InstrumentTuning.Standard:
                return "Standard"
            case InstrumentTuning.DropD:
                return "Drop D"
        }
    }
})

export type InstrumentTuning = Enum.Infer<typeof InstrumentTuning>

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

    static GuitarStandard = new Instrument({
        type: InstrumentType.Guitar,
        tuning: InstrumentTuning.Standard,
        strings: [
            new String(0, 0 / 5, "E", Note.fromName("E", 2)),
            new String(1, 1 / 5, "A", Note.fromName("A", 2)),
            new String(2, 2 / 5, "D", Note.fromName("D", 3)),
            new String(3, 3 / 5, "G", Note.fromName("G", 3)),
            new String(4, 4 / 5, "B", Note.fromName("B", 4)),
            new String(5, 5 / 5, "e", Note.fromName("E", 4)),
        ]
    })

    static GuitarDropD = new Instrument({
        type: InstrumentType.Guitar,
        tuning: InstrumentTuning.DropD,
        strings: [
            new String(0, 0 / 5, "D", Note.fromName("D", 2)),
            new String(1, 1 / 5, "A", Note.fromName("A", 2)),
            new String(2, 2 / 5, "d", Note.fromName("D", 3)),
            new String(3, 3 / 5, "G", Note.fromName("G", 3)),
            new String(4, 4 / 5, "B", Note.fromName("B", 4)),
            new String(5, 5 / 5, "e", Note.fromName("E", 4)),
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
            case InstrumentType.Guitar: {
                switch (tuning) {
                    case InstrumentTuning.Standard:
                        return Instrument.GuitarStandard;
                    case InstrumentTuning.DropD:
                        return Instrument.GuitarDropD;
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
        return InstrumentType.getLabel(this.type) + " (" + InstrumentTuning.getLabel(this.tuning) + ")"
    }

}
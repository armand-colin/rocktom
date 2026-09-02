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

type StringDeclaration = {
    name: string,
    note: Note,
}

namespace StringDeclaration {
    export function create(name: string, note: Note): StringDeclaration {
        return {
            name,
            note,
        }
    }
}

export class Instrument {

    static BassStandard = new Instrument({
        type: InstrumentType.Bass,
        tuning: InstrumentTuning.Standard,
        strings: [
            StringDeclaration.create("E", Note.fromName("E", 1)),
            StringDeclaration.create("A", Note.fromName("A", 1)),
            StringDeclaration.create("D", Note.fromName("D", 2)),
            StringDeclaration.create("G", Note.fromName("G", 2)),
        ]
    })

    static BassDropD = new Instrument({
        type: InstrumentType.Bass,
        tuning: InstrumentTuning.DropD,
        strings: [
            StringDeclaration.create("D", Note.fromName("D", 1)),
            StringDeclaration.create("A", Note.fromName("A", 1)),
            StringDeclaration.create("d", Note.fromName("D", 2)),
            StringDeclaration.create("G", Note.fromName("G", 2)),
        ]
    })

    static GuitarStandard = new Instrument({
        type: InstrumentType.Guitar,
        tuning: InstrumentTuning.Standard,
        strings: [
            StringDeclaration.create("E", Note.fromName("E", 2)),
            StringDeclaration.create("A", Note.fromName("A", 2)),
            StringDeclaration.create("D", Note.fromName("D", 3)),
            StringDeclaration.create("G", Note.fromName("G", 3)),
            StringDeclaration.create("B", Note.fromName("B", 4)),
            StringDeclaration.create("e", Note.fromName("E", 4)),
        ]
    })

    static GuitarDropD = new Instrument({
        type: InstrumentType.Guitar,
        tuning: InstrumentTuning.DropD,
        strings: [
            StringDeclaration.create("D", Note.fromName("D", 2)),
            StringDeclaration.create("A", Note.fromName("A", 2)),
            StringDeclaration.create("d", Note.fromName("D", 3)),
            StringDeclaration.create("G", Note.fromName("G", 3)),
            StringDeclaration.create("B", Note.fromName("B", 4)),
            StringDeclaration.create("e", Note.fromName("E", 4)),
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
        strings: StringDeclaration[]
    }) {
        this.type = opts.type
        this.tuning = opts.tuning
        this.strings = opts.strings.map((declaration, index) => {
            return new String(
                index, 
                index / (opts.strings.length - 1), 
                declaration.name, 
                declaration.note
            )
        })
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
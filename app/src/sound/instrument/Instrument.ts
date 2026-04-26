import { Color } from "three"
import { Note } from "../note/Note"
import { String } from "./String"

export enum InstrumentType {
    Bass = "bass"
}

export class Instrument {

    public static String = String

    readonly name: string
    readonly strings: String[]
    readonly type: InstrumentType

    private _lowestString: String
    private _highestString: String

    static fromType(type: InstrumentType): Instrument {
        switch (type) {
            case InstrumentType.Bass:
                return new Bass()
        }
        throw new Error(`Unknown instrument type: ${type}`)
    }

    constructor(name: string, type: InstrumentType, strings: String[]) {
        this.name = name
        this.type = type
        this.strings = strings

        let lowestString = strings[0]
        let highestString = strings[0]

        for (const string of strings) {
            if (string.note.index < lowestString.note.index)
                lowestString = string
            if (string.note.index > highestString.note.index)
                highestString = string
        }

        this._lowestString = lowestString
        this._highestString = highestString
    }

    get lowestString(): String {
        return this._lowestString
    }

    get highestString(): String {
        return this._highestString
    }

}

export class Bass extends Instrument {

    static E = new String(0, 0 / 3, "E", Note.fromName("E", 1), new Color("#ff1919"), new Color("#ff1b1b"), new Color("#700c0c"))
    static A = new String(1, 1 / 3, "A", Note.fromName("A", 1), new Color("#fcc513"), new Color("#726914ff"), new Color("#58500c"))
    static D = new String(2, 2 / 3, "D", Note.fromName("D", 2), new Color("#2d2dff"), new Color("#2626ff"), new Color("#090934"))
    static G = new String(3, 3 / 3, "G", Note.fromName("G", 2), new Color("#ff6a13"), new Color("#ff7a0d"), new Color("#47280f"))

    constructor() {
        super(
            "Bass",
            InstrumentType.Bass,
            [
                Bass.E,
                Bass.A,
                Bass.D,
                Bass.G
            ]
        )
    }

}

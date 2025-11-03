import { Color } from "three"
import { Note } from "../note/Note"
import { String } from "./String"

export class Instrument {

    public static String = String

    readonly name: string
    readonly strings: String[]

    constructor(name: string, strings: String[]) {
        this.name = name
        this.strings = strings
    }

}

export class Bass extends Instrument {

    static E = new String(0, "E", Note.fromName("E", 1), new Color("#FF0000"))
    static A = new String(1, "A", Note.fromName("A", 1), new Color("#FFFF00"))
    static D = new String(2, "D", Note.fromName("D", 2), new Color("#0000FF"))
    static G = new String(3, "G", Note.fromName("G", 2), new Color("#FF6030"))

    constructor() {
        super("Bass", [
            Bass.E,
            Bass.A,
            Bass.D,
            Bass.G
        ])
    }

}
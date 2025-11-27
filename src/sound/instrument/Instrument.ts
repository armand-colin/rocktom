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

    static E = new String(0, 0 / 3, "E", Note.fromName("E", 1), new Color("#ff1919"), new Color("#ff1b1b"))
    static A = new String(1, 1 / 3, "A", Note.fromName("A", 1), new Color("#fcc513"), new Color("#ffe819"))
    static D = new String(2, 2 / 3, "D", Note.fromName("D", 2), new Color("#2d2dff"), new Color("#2626ff"))
    static G = new String(3, 3 / 3, "G", Note.fromName("G", 2), new Color("#ff6a13"), new Color("rgba(255, 122, 13, 1)"))

    constructor() {
        super("Bass", [
            Bass.E,
            Bass.A,
            Bass.D,
            Bass.G
        ])
    }

}
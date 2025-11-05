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

    static E = new String(0, "E", Note.fromName("E", 1), new Color("#ff1919"), new Color("#ff4848"))
    static A = new String(1, "A", Note.fromName("A", 1), new Color("#fcc513"), new Color("#ffd344"))
    static D = new String(2, "D", Note.fromName("D", 2), new Color("#2d2dff"), new Color("#4f4fff"))
    static G = new String(3, "G", Note.fromName("G", 2), new Color("#ff7d13"), new Color("#ff9946"))

    constructor() {
        super("Bass", [
            Bass.E,
            Bass.A,
            Bass.D,
            Bass.G
        ])
    }

}
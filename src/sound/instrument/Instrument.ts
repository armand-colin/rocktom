import { Note } from "../note/Note"
import { String } from "./String"

export class Instrument {

    public static String = String

    public static Bass = new Instrument("Bass", [
        new String(0, "E", Note.fromName("E", 1)),
        new String(1, "A", Note.fromName("A", 1)),
        new String(2, "D", Note.fromName("G", 2)),
        new String(3, "G", Note.fromName("G", 2)),
    ])

    readonly name: string
    readonly strings: String[]

    constructor(name: string, strings: String[]) {
        this.name = name
        this.strings = strings
    }

}
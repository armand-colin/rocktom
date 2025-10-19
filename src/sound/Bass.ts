import { Note } from "./note/Note";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Bass {

    export class String {

        constructor(
            readonly name: string,
            readonly noteNumber: number,
            readonly index: number
        ) { }

        fret(fret: number) {
            return this.noteNumber + fret
        }

    }

    function noteIndex(name: string, octave: number): number {
        const index = Note.names.indexOf(name)
        return index + octave * 12
    }

    export const E = new String("E", noteIndex("E", 1), 0)
    export const A = new String("A", noteIndex("A", 1), 1)
    export const D = new String("D", noteIndex("D", 2), 2)
    export const G = new String("G", noteIndex("G", 2), 3)

}
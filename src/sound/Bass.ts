import { Note } from "./note/Note";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Bass {

    function noteIndex(name: string, octave: number): number {
        const index = Note.names.indexOf(name)
        return index + octave * 12
    }

    const names = [
        "E",
        "A",
        "D",
        "G"
    ]
    
    const stringsTuning = [
        noteIndex("E", 1),
        noteIndex("A", 1),
        noteIndex("D", 2),
        noteIndex("G", 2),
    ]

    export function getFretNumber(noteNumber: number, stringIndex: number) {
        const baseIndex = stringsTuning[stringIndex]
        return noteNumber - baseIndex
    }

    export function getStringName(stringIndex: number) {
        return names[stringIndex]
    }

}
import { frequencies } from "./frequencies";

export interface FineNote {
    readonly index: number,
    readonly baseFrequency: number,
    readonly frequency: number,
    readonly cents: number,
    readonly name: string,
    readonly octave: number
}

const names = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
]

export class Note {

    readonly index: number

    constructor(index: number) {
        this.index = index
    }

    get name() {
        return names[this.index % 12]
    }

    get octave() {
        return (this.index / 12) | 0
    }

    get frequency() {
        return frequencies[this.index]
    }

    add(semitones: number): Note {
        const newIndex = this.index + semitones
        return notes[newIndex]
    }

    static fromIndex(index: number): Note {
        return notes[index]
    }

    static add(note: Note, semitones: number): Note {
        const newIndex = note.index + semitones
        return notes[newIndex]
    }

    static fromName(name: string, octave: number): Note {
        const noteIndex = names.indexOf(name) + octave * 12
        return notes[noteIndex]
    }

}

const notes: Note[] = []
for (let octave = 0; octave < 8; octave++) {
    for (let i = 0; i < names.length; i++) {
        const index = octave * 12 + i
        notes.push(new Note(index))
    }
}

function cents(referenceFrequency: number, frequency: number): number {
    return Math.floor(1200 * Math.log(frequency / referenceFrequency) / Math.log(2))
}

function closestFrequency(frequency: number): FineNote {
    // TODO: Dichotomic search
    let index = 0
    let distance = Math.abs(frequency - frequencies[0])

    for (let i = index + 1; i < frequencies.length - 1; i++) {
        const currentDistance = Math.abs(frequency - frequencies[i])
        if (currentDistance > distance)
            break

        index = i
        distance = currentDistance
    }

    return {
        baseFrequency: frequencies[index],
        frequency,
        index,
        name: names[index % 12],
        cents: cents(frequencies[index], frequency),
        octave: (index / 12) | 0
    }
}

export const FineNote = {
    closestFrequency,
    cents,
    names
}
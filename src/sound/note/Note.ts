import { frequencies } from "./frequencies";

export interface Note {
    readonly index: number,
    readonly frequency: number,
}

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

function fromName(name: string, octave: number): Note {
    const noteIndex = names.indexOf(name)

    return {
        index: noteIndex + octave * 12,
        frequency: frequencies[noteIndex + octave * 12]
    }
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
        cents: Math.floor(1200 * Math.log(frequency / frequencies[index]) / Math.log(2)),
        octave: (index / 12) | 0
    }
}

export const FineNote = {
    closestFrequency,
    names
}

export const Note = {
    fromName,
    fromIndex: (index: number): Note => ({
        index,
        frequency: frequencies[index]
    })
}
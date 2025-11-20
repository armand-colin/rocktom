import type { String } from "../instrument/String";

export interface NoteEvent {
    fingerPosition: number
    time: number
    duration: number
    string: String
    fret: number
    slide: {
        fret: number
        duration: number
        connect: boolean
    } | null
}

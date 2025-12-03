import { nanoid } from "nanoid";
import type { String } from "../instrument/String";

export type NoteSlide = {
    fret: number
    duration: number
    connect: boolean
}

export interface NoteEvent {
    id: string,
    fingerPosition: number
    time: number
    duration: number
    string: String
    fret: number
    slide: NoteSlide | null
}

function create(opts: {
    id?: string,
    fingerPosition?: number,
    time: number,
    duration: number,
    string: String,
    fret: number,
    slide?: NoteSlide | null
}): NoteEvent {
    return {
        id: opts.id ?? nanoid(),
        fingerPosition: opts.fingerPosition ?? 0,
        time: opts.time,
        duration: opts.duration,
        string: opts.string,
        fret: opts.fret,
        slide: opts.slide ?? null
    }
}

export const NoteEvent = {
    create
}

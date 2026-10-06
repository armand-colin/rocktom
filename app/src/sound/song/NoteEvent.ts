import { nanoid } from "nanoid";
import type { Instrument } from "../instrument/Instrument";
import type { String } from "../instrument/String";
import { Chord, type SerializedChord } from "../note/Chord";

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
    chord: Chord | null
}

export interface SerializedNoteEvent {
    id: string,
    fingerPosition: number
    time: number
    duration: number
    stringIndex: number,
    fret: number,
    slide: NoteSlide | null
    chord?: SerializedChord
}

function create(opts: {
    id?: string,
    fingerPosition?: number,
    time: number,
    duration: number,
    string: String,
    fret: number,
    slide?: NoteSlide | null
    chord?: Chord | null
}): NoteEvent {
    return {
        id: opts.id ?? nanoid(),
        fingerPosition: opts.fingerPosition ?? 0,
        time: opts.time,
        duration: opts.duration,
        string: opts.string,
        fret: opts.fret,
        slide: opts.slide ?? null,
        chord: opts.chord ?? null,
    }
}

function serialize(note: NoteEvent): SerializedNoteEvent {
    const data: SerializedNoteEvent = {
        id: note.id,
        fingerPosition: note.fingerPosition,
        time: note.time,
        duration: note.duration,
        stringIndex: note.string.index,
        fret: note.fret,
        slide: note.slide,
    }

    if (note.chord !== null)
        data.chord = note.chord.serialize()

    return data
}

function deserialize(data: SerializedNoteEvent, instrument: Instrument): NoteEvent {
    return {
        id: data.id,
        fingerPosition: data.fingerPosition,
        time: data.time,
        duration: data.duration,
        string: instrument.strings[data.stringIndex],
        fret: data.fret,
        slide: data.slide,
        chord: data.chord === undefined ? null : Chord.deserialize(data.chord),
    }
}

function clone(note: NoteEvent): NoteEvent {
    return {
        ...note,
        id: nanoid(),
        slide: note.slide ? { ...note.slide } : null,
        chord: note.chord,
    }
}

export const NoteEvent = {
    create,
    serialize,
    deserialize,
    clone
}

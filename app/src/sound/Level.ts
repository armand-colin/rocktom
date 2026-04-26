import { nanoid } from "nanoid";
import type { Instrument } from "./instrument/Instrument";
import { AudioTrack, AudioType, type SerializedAudioTrack } from "./song/AudioTrack";
import { Focus } from "./song/Focus";
import { FocusTrack, type SerializedFocusTrack } from "./song/FocusTrack";
import { NoteTrack, type SerializedNoteTrack } from "./song/NoteTrack";
import { TempoTrack, type SerializedTempoTrack } from "./song/TempoTrack";
import { Tempo } from "./Tempo";

type SerializedLevel = {
    id: string,
    name: string,
    author: string,
    tracks: {
        note: SerializedNoteTrack,
        audio: SerializedAudioTrack,
        tempo: SerializedTempoTrack,
        focus: SerializedFocusTrack
    }
}

export class Level {

    readonly id: string
    name: string
    author: string

    readonly noteTrack: NoteTrack
    readonly audioTrack: AudioTrack
    readonly tempoTrack: TempoTrack
    readonly focusTrack: FocusTrack

    static create(instrument: Instrument) {
        return new Level({
            name: "New Level",
            author: "Unknown",
            tracks: {
                note: new NoteTrack(instrument, [], []),
                audio: new AudioTrack({ type: AudioType.None }, 0, 0),
                tempo: new TempoTrack(new Tempo(120)),
                focus: new FocusTrack(Focus.default(), [])
            }
        })
    }

    constructor(opts: {
        id?: string,
        name: string,
        author: string,
        tracks: {
            note: NoteTrack,
            audio: AudioTrack,
            tempo: TempoTrack,
            focus: FocusTrack
        }
    }) {
        this.id = opts?.id ?? nanoid()
        this.name = opts.name
        this.author = opts.author

        this.noteTrack = opts.tracks?.note
        this.audioTrack = opts.tracks?.audio
        this.tempoTrack = opts.tracks?.tempo
        this.focusTrack = opts.tracks?.focus
    }

    clone(): Level {
        return new Level({
            author: this.author,
            name: this.name + " (cloned)",
            tracks: {
                audio: this.audioTrack.clone(),
                focus: this.focusTrack.clone(),
                note: this.noteTrack.clone(),
                tempo: this.tempoTrack.clone()
            }
        })
    }

    get durationInTicks() {
        const lastNote = this.noteTrack.lastNote
        if (!lastNote)
            return 0

        return lastNote.time + lastNote.duration
    }

    get durationInSeconds(): number {
        return this.tempoTrack.secondsFromTicks(this.durationInTicks)
    }

    serialize(): SerializedLevel {
        return {
            id: this.id,
            name: this.name,
            author: this.author,
            tracks: {
                note: this.noteTrack.serialize(),
                audio: this.audioTrack.serialize(),
                tempo: this.tempoTrack.serialize(),
                focus: this.focusTrack.serialize()
            }
        }
    }

    static deserialize(data: SerializedLevel): Level {
        return new Level({
            id: data.id,
            name: data.name,
            author: data.author,
            tracks: {
                note: NoteTrack.deserialize(data.tracks.note),
                audio: AudioTrack.deserialize(data.tracks.audio),
                tempo: TempoTrack.deserialize(data.tracks.tempo),
                focus: FocusTrack.deserialize(data.tracks.focus)
            }
        })
    }

}
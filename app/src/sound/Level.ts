import { nanoid } from "nanoid";
import { AudioTrack, type SerializedAudioTrack } from "./song/AudioTrack";
import { FocusTrack, type SerializedFocusTrack } from "./song/FocusTrack";
import { NoteTrack, type SerializedNoteTrack } from "./song/NoteTrack";
import { TempoTrack, type SerializedTempoTrack } from "./song/TempoTrack";

type SerializedLevel = {
    id: string,
    name: string,
    tracks: SerializedTracks
}

type SerializedTracks = {
    note: SerializedNoteTrack,
    audio: SerializedAudioTrack,
    tempo: SerializedTempoTrack,
    focus: SerializedFocusTrack
}

export class Level {

    readonly id: string
    name: string

    readonly noteTrack: NoteTrack
    readonly audioTrack: AudioTrack
    readonly tempoTrack: TempoTrack
    readonly focusTrack: FocusTrack

    constructor(opts: {
        id: string,
        name: string,
        tracks: {
            note: NoteTrack,
            audio: AudioTrack,
            tempo: TempoTrack,
            focus: FocusTrack
        }
    }) {
        this.id = opts.id
        this.name = opts.name

        this.noteTrack = opts.tracks?.note
        this.audioTrack = opts.tracks?.audio
        this.tempoTrack = opts.tracks?.tempo
        this.focusTrack = opts.tracks?.focus
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

    clone(): Level {
        return new Level({
            id: nanoid(),
            name: this.name + " (cloned)",
            tracks: {
                audio: this.audioTrack.clone(),
                focus: this.focusTrack.clone(),
                note: this.noteTrack.clone(),
                tempo: this.tempoTrack.clone()
            }
        })
    }

    serialize(): SerializedLevel {
        return {
            id: this.id,
            name: this.name,
            tracks: this.serializeTracks()
        }
    }

    static deserialize(data: SerializedLevel): Level {
        return new Level({
            id: data.id,
            name: data.name,
            tracks: Level.deserializeTracks(data.tracks)
        })
    }

    serializeTracks(): SerializedTracks {
        return {
            note: this.noteTrack.serialize(),
            audio: this.audioTrack.serialize(),
            tempo: this.tempoTrack.serialize(),
            focus: this.focusTrack.serialize()
        }
    }

    static deserializeTracks(data: SerializedTracks): {
        note: NoteTrack,
        audio: AudioTrack,
        tempo: TempoTrack,
        focus: FocusTrack
    } {
        return {
            note: NoteTrack.deserialize(data.note),
            audio: AudioTrack.deserialize(data.audio),
            tempo: TempoTrack.deserialize(data.tempo),
            focus: FocusTrack.deserialize(data.focus)
        }
    }

}
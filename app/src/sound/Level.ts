import { AudioTrack, type SerializedAudioTrack } from "./song/AudioTrack";
import { FocusTrack, type SerializedFocusTrack } from "./song/FocusTrack";
import { NoteTrack, type SerializedNoteTrack } from "./song/NoteTrack";
import { TempoTrack, type SerializedTempoTrack } from "./song/TempoTrack";


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
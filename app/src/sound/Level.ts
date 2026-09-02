import { nanoid } from "nanoid";
import { AudioTrack, type SerializedAudioTrack } from "./song/AudioTrack";
import { FocusTrack, type SerializedFocusTrack } from "./song/FocusTrack";
import { NoteTrack, type SerializedNoteTrack } from "./song/NoteTrack";
import { TempoTrack, type SerializedTempoTrack } from "./song/TempoTrack";
import { Instrument } from "./instrument/Instrument";
import { Focus } from "./song/Focus";
import { Tempo } from "./Tempo";

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

    static default(opts: {
        id: string,
        name: string,
    }): Level {
        return new Level({
            id: opts.id,
            name: opts.name,
            tracks: {
                note: new NoteTrack(Instrument.BassStandard, [], []),
                audio: new AudioTrack({ time: 0, playbackId: null }),
                tempo: new TempoTrack(new Tempo(120)),
                focus: new FocusTrack(Focus.default(), [])
            }
        })
    }

    static deserialize(opts: {
        serialized: string,
        id: string,
        name: string,
    }): Level {
        if (opts.serialized === "" || opts.serialized === "{}") {
            return Level.default(opts)
        }

        const tracks = Level.deserializeTracks(JSON.parse(opts.serialized))

        return new Level({
            id: opts.id,
            name: opts.name,
            tracks: tracks
        })
    }

    private constructor(opts: {
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
        let end = 0

        for (const timedPattern of this.noteTrack.timedPatterns) {
            end = Math.max(end, timedPattern.time + timedPattern.duration)
        }

        for (const note of this.noteTrack.notes()) {
            end = Math.max(end, note.time + note.duration)
        }

        return end
    }

    get durationInSeconds(): number {
        return this.tempoTrack.secondsFromTicks(this.durationInTicks)
    }

    getInstrumentTypes(): string[] {
        return [this.noteTrack.instrument.type]
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
import { nanoid } from "nanoid";
import { AudioTrack, type SerializedAudioTrack } from "./song/AudioTrack";
import { FocusTrack, type SerializedFocusTrack } from "./song/FocusTrack";
import { InstrumentTrack, type SerializedInstrumentTrack } from "./song/InstrumentTrack";
import { NoteTrack, type SerializedNoteTrack } from "./song/NoteTrack";
import { TempoTrack, type SerializedTempoTrack } from "./song/TempoTrack";
import { Focus } from "./song/Focus";
import { Tempo } from "./Tempo";

type SerializedLevel = {
    id: string,
    name: string,
    tracks: SerializedTracks
}

type SerializedTracks = {
    instrumentTracks: SerializedInstrumentTrack[],
    audio: SerializedAudioTrack,
    tempo: SerializedTempoTrack,
}

type SerializedTracksInput = {
    instrumentTracks?: SerializedInstrumentTrack[],
    noteTracks?: SerializedNoteTrack[],
    note?: SerializedNoteTrack,
    audio: SerializedAudioTrack,
    tempo: SerializedTempoTrack,
    focus?: SerializedFocusTrack
}

export class Level {

    readonly id: string
    name: string

    readonly instrumentTracks: InstrumentTrack[]
    readonly audioTrack: AudioTrack
    readonly tempoTrack: TempoTrack

    static default(opts: {
        id: string,
        name: string,
    }): Level {
        return new Level({
            id: opts.id,
            name: opts.name,
            tracks: {
                instrumentTracks: [InstrumentTrack.default()],
                audio: new AudioTrack({ time: 0, playbackId: null }),
                tempo: new TempoTrack(new Tempo(120)),
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
            instrumentTracks: InstrumentTrack[],
            audio: AudioTrack,
            tempo: TempoTrack,
        }
    }) {
        this.id = opts.id
        this.name = opts.name

        this.instrumentTracks = opts.tracks.instrumentTracks
        this.audioTrack = opts.tracks.audio
        this.tempoTrack = opts.tracks.tempo
    }

    get durationInTicks() {
        let end = 0

        for (const instrumentTrack of this.instrumentTracks) {
            for (const timedPattern of instrumentTrack.noteTrack.timedPatterns) {
                end = Math.max(end, timedPattern.time + timedPattern.duration)
            }

            for (const note of instrumentTrack.noteTrack.notes()) {
                end = Math.max(end, note.time + note.duration)
            }
        }

        return end
    }

    get durationInSeconds(): number {
        return this.tempoTrack.secondsFromTicks(this.durationInTicks)
    }

    getInstrumentTypes(): string[] {
        const types: string[] = []

        for (const instrumentTrack of this.instrumentTracks) {
            const type = instrumentTrack.instrument.type
            if (!types.includes(type))
                types.push(type)
        }

        return types
    }

    clone(): Level {
        return new Level({
            id: nanoid(),
            name: this.name + " (cloned)",
            tracks: {
                audio: this.audioTrack.clone(),
                instrumentTracks: this.instrumentTracks.map(track => track.clone()),
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
            instrumentTracks: this.instrumentTracks.map(track => track.serialize()),
            audio: this.audioTrack.serialize(),
            tempo: this.tempoTrack.serialize(),
        }
    }

    static deserializeTracks(data: SerializedTracksInput): {
        instrumentTracks: InstrumentTrack[],
        audio: AudioTrack,
        tempo: TempoTrack,
    } {
        return {
            instrumentTracks: Level.deserializeInstrumentTracks(data),
            audio: AudioTrack.deserialize(data.audio),
            tempo: TempoTrack.deserialize(data.tempo),
        }
    }

    private static deserializeInstrumentTracks(data: SerializedTracksInput): InstrumentTrack[] {
        if (Array.isArray(data.instrumentTracks)) {
            const tracks = data.instrumentTracks.map(track => InstrumentTrack.deserialize(track))
            if (tracks.length === 0)
                tracks.push(InstrumentTrack.default())
            return tracks
        }

        const serializedNotes = Array.isArray(data.noteTracks)
            ? data.noteTracks
            : data.note
                ? [data.note]
                : []

        const sharedFocus = data.focus
            ? FocusTrack.deserialize(data.focus)
            : new FocusTrack(Focus.default(), [])

        const tracks = serializedNotes.map(note => new InstrumentTrack({
            noteTrack: NoteTrack.deserialize(note),
            focusTrack: sharedFocus.clone(),
        }))

        if (tracks.length === 0)
            tracks.push(InstrumentTrack.default())

        return tracks
    }

}

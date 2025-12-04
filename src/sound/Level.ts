import { nanoid } from "nanoid";
import type { Instrument } from "./instrument/Instrument";
import { AudioTrack, AudioType } from "./song/AudioTrack";
import { Focus } from "./song/Focus";
import { FocusTrack } from "./song/FocusTrack";
import { NoteTrack } from "./song/NoteTrack";
import { TempoTrack } from "./song/TempoTrack";
import { Tempo } from "./Tempo";

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
            instrument,
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
        instrument: Instrument,
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

    get durationInTicks() {
        const lastNote = this.noteTrack.lastNote
        if (!lastNote)
            return 0

        return lastNote.time + lastNote.duration
    }

    get durationInSeconds(): number {
        return this.tempoTrack.secondsFromTicks(this.durationInTicks)
    }

}
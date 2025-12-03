import { AudioTrack, AudioType } from "./song/AudioTrack";
import { FocusTrack } from "./song/FocusTrack";
import { TempoTrack } from "./song/TempoTrack";
import { NoteTrack } from "./song/NoteTrack";
import { nanoid } from "nanoid";
import type { Instrument } from "./instrument/Instrument";
import { Tempo } from "./Tempo";
import { Focus } from "./song/Focus";

export class Level {

    readonly id: string
    name: string
    author: string

    readonly bassTrack: NoteTrack
    readonly audioTrack: AudioTrack
    readonly tempoTrack: TempoTrack
    readonly focusTrack: FocusTrack

    static create(instrument: Instrument) {
        return new Level({
            name: "New Level",
            author: "Unknown",
            instrument,
            tracks: {
                bass: new NoteTrack(instrument, [], []),
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
            bass: NoteTrack,
            audio: AudioTrack,
            tempo: TempoTrack,
            focus: FocusTrack
        }
    }) {
        this.id = opts?.id ?? nanoid()
        this.name = opts.name
        this.author = opts.author

        this.bassTrack = opts.tracks?.bass 
        this.audioTrack = opts.tracks?.audio
        this.tempoTrack = opts.tracks?.tempo
        this.focusTrack = opts.tracks?.focus
    }

    get durationInTicks() {
        const lastNote = this.bassTrack.lastNote
        if (!lastNote)
            return 0

        return lastNote.time + lastNote.duration
    }

    get durationInSeconds(): number {
        return this.tempoTrack.secondsFromTicks(this.durationInTicks)
    }

}
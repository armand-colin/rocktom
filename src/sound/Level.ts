import type { MidiNote } from "./MidiNote";
import type { Timing } from "./timing/Timing";

export enum LevelEventType {
    Note = 0,
    AudioStart = 1
}

export type LevelEvent = {
    type: LevelEventType.Note,
    time: number,
    note: MidiNote
} | {
    type: LevelEventType.AudioStart,
    time: number,
}

export class Level {

    timing: Timing
    events: LevelEvent[] = []
    audioBuffer: AudioBuffer

    constructor(
        timing: Timing,
        audioBuffer: AudioBuffer,
        audioStartTime: number
    ) {
        this.timing = timing
        this.audioBuffer = audioBuffer

        this.events.push({
            type: 1,
            time: audioStartTime
        })
    }

    private _addEvent(event: LevelEvent) {
        // Addind event in order
        for (let i = 0; i < this.events.length; i++) {
            if (event.time >= this.events[i].time)
                continue

            this.events.splice(i, 0, event)
            return
        }

        this.events.push(event)
    }

    addNote(note: MidiNote) {
        this._addEvent({
            type: LevelEventType.Note,
            time: note.time,
            note,
        })
    }

}
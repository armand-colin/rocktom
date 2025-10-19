import type { MidiNote } from "./MidiNote";

export class MidiTrack {

    private _notes: MidiNote[] = []

    push(note: MidiNote) {
        // Shall find index in our ordered event queue
        for (let i = 0; i < this._notes.length; i++) {
            if (note.time >= this._notes[i].time)
                continue

            this._notes.splice(i, 0, note)
            return
        }

        this._notes.push(note)
    }

    get notes() {
        return this._notes
    }

}
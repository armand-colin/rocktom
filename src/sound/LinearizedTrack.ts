import type { NoteEvent } from "./song/NoteEvent";

export class LinearizedTrack {

    notes: NoteEvent[]

    constructor(notes: NoteEvent[]) {
        this.notes = notes
    }

}
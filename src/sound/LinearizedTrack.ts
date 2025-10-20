import type { NoteEvent } from "./song/Pattern";

export class LinearizedTrack {

    notes: NoteEvent[]

    constructor(notes: NoteEvent[]) {
        this.notes = notes
    }

}
import { Component, Engine } from "@niloc/ecs";
import type { NoteTrack } from "../../sound/song/NoteTrack";

export class NoteTrackEditor extends Component {

    readonly track: NoteTrack

    constructor(engine: Engine, track: NoteTrack) {
        super(engine)
        this.track = track
    }

}
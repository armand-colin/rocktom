import { Component, Engine } from "@niloc/ecs";
import type { TempoTrack } from "../sound/song/TempoTrack";

export class TempoTrackEditor extends Component {

    readonly track: TempoTrack

    constructor(engine: Engine, tempoTrack: TempoTrack) {
        super(engine)
        this.track = tempoTrack
    }

}
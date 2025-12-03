import { Component, Engine } from "@niloc/ecs";
import type { TempoTrack } from "../../sound/song/TempoTrack";
import { Tempo } from "../../sound/Tempo";

export class TempoTrackEditor extends Component {

    readonly track: TempoTrack

    constructor(engine: Engine, tempoTrack: TempoTrack) {
        super(engine)
        this.track = tempoTrack
    }

    setInitial(bpm: number) {
        this.track.initialTempo = new Tempo(bpm)
        this.track.refreshTime()
        this.changed()
    }

    addEvent(ticks: number) {
        const tempo = this.track.getTempoAt(ticks)
        this.track.add(ticks, tempo)
        this.track.refreshTime()
        this.changed()
    }

}
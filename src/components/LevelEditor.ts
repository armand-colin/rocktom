import { Component, Engine } from "@niloc/ecs";
import type { Level } from "../sound/Level";
import { TempoTrackEditor } from "./TempoTrackEditor";

export class LevelEditor extends Component {

    readonly level: Level

    readonly tempoTrack: TempoTrackEditor

    constructor(engine: Engine, level: Level) {
        super(engine)
        this.level = level
        this.tempoTrack = engine.createComponent(TempoTrackEditor, level.tempoTrack)
    }

}
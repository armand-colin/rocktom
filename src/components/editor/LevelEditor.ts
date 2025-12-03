import { Component, Engine } from "@niloc/ecs";
import { TempoTrackEditor } from "./TempoTrackEditor";
import type { Level } from "../../sound/Level";
import { TimeTransform } from "./TimeTransform";
import { AudioTrackEditor } from "./AudioTrackEditor";

export class LevelEditor extends Component {

    readonly level: Level
    readonly tempoTrack: TempoTrackEditor
    readonly audioTrack: AudioTrackEditor
    readonly timeTransform: TimeTransform

    constructor(engine: Engine, level: Level) {
        super(engine)
        this.level = level
        this.tempoTrack = engine.createComponent(TempoTrackEditor, level.tempoTrack)
        this.timeTransform = engine.createComponent(TimeTransform)
        this.audioTrack = engine.createComponent(AudioTrackEditor, level.audioTrack)
    }

}
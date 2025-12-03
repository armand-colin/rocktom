import { Component, Engine } from "@niloc/ecs";
import type { Level } from "../../sound/Level";
import { AudioTrackEditor } from "./AudioTrackEditor";
import { EditorPlayer } from "./EditorPlayer";
import { TempoTrackEditor } from "./TempoTrackEditor";
import { TimeTransform } from "./TimeTransform";

export class LevelEditor extends Component {

    readonly level: Level
    readonly tempoTrack: TempoTrackEditor
    readonly audioTrack: AudioTrackEditor
    readonly timeTransform: TimeTransform
    readonly player: EditorPlayer

    constructor(engine: Engine, level: Level) {
        super(engine)
        this.level = level
        this.tempoTrack = engine.createComponent(TempoTrackEditor, level.tempoTrack)
        this.timeTransform = engine.createComponent(TimeTransform)
        this.audioTrack = engine.createComponent(AudioTrackEditor, level.audioTrack)
        this.player = engine.createComponent(EditorPlayer, level)

        this.audioTrack.onChange(() => {
            this.player.refreshAudioPlayer()
        })
    }

}
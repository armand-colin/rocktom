import { Component, Engine } from "@niloc/ecs";
import { lerp } from "three/src/math/MathUtils.js";
import { Input, InputManager } from "../../resources/InputManager";
import type { Level } from "../../sound/Level";
import type { Pattern } from "../../sound/song/Pattern";
import { TimeTransformViewId } from "../../ui/levelEditor/TimeTransformView";
import { OS } from "../../utils/OS";
import { AudioTrackEditor } from "./AudioTrackEditor";
import { EditorPlayer } from "./EditorPlayer";
import { NoteTrackEditor } from "./NoteTrackEditor";
import { PatternEditor } from "./PatternEditor";
import { TempoTrackEditor } from "./TempoTrackEditor";
import { TimeTransform } from "./TimeTransform";

export class LevelEditor extends Component {

    readonly level: Level
    readonly tempoTrack: TempoTrackEditor
    readonly audioTrack: AudioTrackEditor
    readonly timeTransform: TimeTransform
    readonly player: EditorPlayer
    readonly noteTrack: NoteTrackEditor

    private _pattern: PatternEditor | null = null

    constructor(engine: Engine, level: Level) {
        super(engine)
        this.level = level
        this.tempoTrack = engine.createComponent(TempoTrackEditor, level.tempoTrack)
        this.timeTransform = engine.createComponent(TimeTransform)
        this.audioTrack = engine.createComponent(AudioTrackEditor, level.audioTrack)
        this.player = engine.createComponent(EditorPlayer, level)
        this.noteTrack = engine.createComponent(NoteTrackEditor, level.noteTrack)

        this.audioTrack.onChange(() => {
            this.player.refreshAudioPlayer()
        })

        window.addEventListener("wheel", this._onWheel)
        window.addEventListener("scroll", this._onScroll)

        const inputManager = engine.getResource(InputManager)
        inputManager.register(Input.Play, () => {
            if (this.player.playing) {
                this.player.pause()
                this.player.seekToPreviousState()
            } else {
                this.player.play()
            }
        })
    }

    get pattern() {
        return this._pattern
    }

    editPattern(pattern: Pattern | null) {
        this._pattern?.destroy()
        this._pattern = null

        if (pattern) {
            const editor = this.engine.createComponent(PatternEditor, pattern) as PatternEditor
            this._pattern = editor
        }

        this.changed()
    }
    private _onScroll = (event: Event) => {
        event.preventDefault()
    }

    private _onWheel = (event: WheelEvent) => {
        event.preventDefault()

        if (OS.isCtrl(event)) {
            this._handleZoom(event)
        } else {
            this._handlePan(event)
        }
    }

    private _handleZoom(event: WheelEvent) {
        const delta = event.deltaY
        const percentChange = 1 - delta * 0.001

        const mouseX = event.clientX
        const element = document.querySelector("#" + TimeTransformViewId)
        if (!element)
            return

        const rect = element.getBoundingClientRect()
        const offsetX = mouseX - rect.left

        // Shall zoom centered on ticksAtMouse
        let ratio = this.timeTransform.ratio
        ratio = ratio * percentChange
        ratio = Math.max(0.01, Math.min(10, ratio))

        // New offset to keep ticksAtMouse under the mouse
        const previousWidth = rect.width / this.timeTransform.ratio
        const width = rect.width / ratio
        const mouseT = offsetX / rect.width
        const offsetDelta = lerp(0, width - previousWidth, mouseT)

        let offset = this.timeTransform.offset + offsetDelta
        offset = Math.min(0, offset)

        this.timeTransform.setOffset(offset)
        this.timeTransform.setRatio(ratio)
    }

    private _handlePan(event: WheelEvent) {
        const delta = -event.deltaX

        let offset = this.timeTransform.offset
        offset = offset + delta / this.timeTransform.ratio
        offset = Math.min(0, offset)

        this.timeTransform.setOffset(offset)
    }

    destroy() {
        super.destroy()
        this.player.destroy()
        window.removeEventListener("wheel", this._onWheel)
        window.removeEventListener("scroll", this._onScroll)
    }

}
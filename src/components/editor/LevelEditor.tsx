import { Component, Engine } from "@niloc/ecs";
import { WindowManager, type Window } from "../../resources/WindowManager";
import type { Level } from "../../sound/Level";
import type { TimedPattern } from "../../sound/song/Pattern";
import { PatternEditorView } from "../../ui/levelEditor/PatternEditorView";
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
    private _patternWindow: Window | null = null

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

        window.addEventListener("wheel", this._onWheel, { passive: false })
        window.addEventListener("scroll", this._onScroll, { passive: false })
    }

    get pattern() {
        return this._pattern
    }

    editPattern(pattern: TimedPattern | null) {
        this._pattern?.destroy()
        this._pattern = null

        if (pattern) {
            const editor = this.engine.createComponent(PatternEditor, pattern) as PatternEditor
            this._pattern = editor

            const windowManager = this.engine.getResource(WindowManager)

            if (!this._patternWindow) {
                const window = windowManager.add(
                    { name: "Pattern editor" },
                    () => <PatternEditorView editor={editor} player={this.player} />
                )

                window.events.on('closed', () => {
                    if (this._patternWindow === window) {
                        this._patternWindow = null
                        this._pattern?.destroy()
                        this._pattern = null
                        this.changed()
                    }
                })

                this._patternWindow = window
            } else {
                windowManager.setContent(
                    this._patternWindow.id,
                    () => <PatternEditorView editor={editor} player={this.player} />
                )
            }
        }

        if (pattern === null) {
            this._patternWindow?.close()
            this._patternWindow = null
        }

        this.changed()
    }

    private _onScroll = (event: Event) => {
        event.preventDefault()
    }

    private _onWheel = (event: WheelEvent) => {
        event.preventDefault()
    }

    destroy() {
        super.destroy()
        this.player.destroy()
        this._pattern?.destroy()
        this._pattern = null
        this._patternWindow?.close()
        this._patternWindow = null
        window.removeEventListener("wheel", this._onWheel)
        window.removeEventListener("scroll", this._onScroll)
    }

}
import { Component, Engine } from "@niloc/ecs";
import { Vec2 } from "@niloc/utils";
import { WindowManager, WindowPosition, WindowSize, type Window } from "../../resources/WindowManager";
import type { Level } from "../../sound/Level";
import type { Instrument } from "../../sound/instrument/Instrument";
import { NoteTrack } from "../../sound/song/NoteTrack";
import type { TimedPattern } from "../../sound/song/Pattern";
import { Tempo } from "../../sound/Tempo";
import { PatternEditorView } from "../../ui/levelEditor/patternEditor/PatternEditorView";
import { MixerView } from "../../ui/mixerView/MixerView";
import { VirtualBass } from "../VirtualBass";
import { AudioTrackEditor } from "./AudioTrackEditor";
import { AudioWaveformRenderer } from "./AudioWaveformRenderer";
import { EditorPlayer } from "./EditorPlayer";
import { FocusTrackEditor } from "./FocusTrackEditor";
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
    readonly noteTracks: NoteTrackEditor[]
    readonly focusTrack: FocusTrackEditor
    readonly audioWaveformRenderer: AudioWaveformRenderer

    readonly virtualBass: VirtualBass

    private _pattern: PatternEditor | null = null
    private _patternWindow: Window | null = null
    private _mixerWindow: Window | null = null

    constructor(engine: Engine, level: Level) {
        super(engine)
        this.level = level
        this.tempoTrack = engine.createComponent(TempoTrackEditor, level.tempoTrack)
        this.timeTransform = engine.createComponent(TimeTransform)
        this.timeTransform.setStep(Tempo.beats(1))

        this.audioTrack = engine.createComponent(AudioTrackEditor, level.id, level.audioTrack)
        this.focusTrack = engine.createComponent(FocusTrackEditor, level.focusTrack)
        this.virtualBass = engine.createComponent(VirtualBass)
        this.player = engine.createComponent(EditorPlayer, level, this.virtualBass)
        this.noteTracks = level.noteTracks.map(track =>
            engine.createComponent(NoteTrackEditor, track, this.virtualBass)
        )

        this.audioWaveformRenderer = engine.createComponent(AudioWaveformRenderer, {
            tempoTrack: this.tempoTrack,
            audioTrack: this.audioTrack,
            transform: this.timeTransform
        })

        this.audioTrack.onChange(() => {
            this.player.refreshAudioPlayer()
        })

        window.addEventListener("wheel", this._onWheel, { passive: false })
        window.addEventListener("scroll", this._onScroll, { passive: false })
    }

    get pattern() {
        return this._pattern
    }

    setName(name: string) {
        this.level.name = name
        this.changed()
    }

    addNoteTrack(instrument: Instrument) {
        const track = new NoteTrack({
            instrument,
            timedPatterns: [],
            markers: [],
        })

        this.level.noteTracks.push(track)
        this.noteTracks.push(
            this.engine.createComponent(NoteTrackEditor, track, this.virtualBass)
        )
        this.changed()
    }

    removeNoteTrack(id: string) {
        if (this.noteTracks.length <= 1)
            return

        const editorIndex = this.noteTracks.findIndex(editor => editor.track.id === id)
        if (editorIndex === -1)
            return

        const editor = this.noteTracks[editorIndex]
        const shouldClosePattern = this._pattern && editor.track.patterns.has(this._pattern.pattern.id)

        this.noteTracks.splice(editorIndex, 1)

        const trackIndex = this.level.noteTracks.findIndex(track => track.id === id)
        if (trackIndex !== -1)
            this.level.noteTracks.splice(trackIndex, 1)

        if (shouldClosePattern)
            this.editPattern(null)
        else
            this.changed()

        editor.destroy()
    }

    editPattern(pattern: TimedPattern | null) {
        this._pattern?.destroy()
        this._pattern = null

        if (pattern) {
            const editor = this.engine.createComponent(PatternEditor, pattern, this.virtualBass) as PatternEditor
            this._pattern = editor

            const windowManager = this.engine.getResource(WindowManager)

            if (!this._patternWindow) {
                const window = windowManager.add(
                    { 
                        name: "Pattern editor",
                        size: WindowSize.relative(0.8),
                        position: WindowPosition.centered(),
                    },
                    () => <PatternEditorView
                        editor={editor}
                        player={this.player}
                    />,
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

    toggleMixer(show?: boolean) {
        show ??= !this._mixerWindow

        if (show) {
            if (this._mixerWindow)
                return

            const windowManager = this.engine.getResource(WindowManager)
            this._mixerWindow = windowManager.add(
                { 
                    name: "Mixer", 
                    id: "mixer",
                    size: WindowSize.fixed(Vec2.create(530, 370))
                },
                () => <MixerView />
            )
            this.changed()

            this._mixerWindow.events.on('closed', () => {
                this._mixerWindow = null
                this.changed()
            })
        } else {
            this._mixerWindow?.close()
            this._mixerWindow = null
            this.changed()
        }
    }

    private _onScroll = (event: Event) => {
        event.preventDefault()
    }

    private _onWheel = (event: WheelEvent) => {
        event.preventDefault()
    }

    destroy() {
        super.destroy()
        for (const noteTrack of this.noteTracks)
            noteTrack.destroy()
        this.player.destroy()
        this._pattern?.destroy()
        this._pattern = null
        this._patternWindow?.close()
        this._patternWindow = null
        this._mixerWindow?.close()
        this._mixerWindow = null
        window.removeEventListener("wheel", this._onWheel)
        window.removeEventListener("scroll", this._onScroll)
    }

}
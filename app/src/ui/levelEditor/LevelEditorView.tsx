import { EngineContext, useComponent } from "@niloc/ecs-react";
import { useContext, useMemo } from "react";
import type { EditorPlayer } from "../../components/editor/EditorPlayer";
import { LevelEditor } from "../../components/editor/LevelEditor";
import { Mixer } from "../../resources/Mixer";
import type { TimedPattern } from "../../sound/song/Pattern";
import { Button, ButtonTheme } from "../button/Button";
import { Icon } from "../icon/Icon";
import { StringInput } from "../input/StringInput";
import { AudioTrackEditorView } from "./AudioTrackEditorView";
import { FocusTrackEditorView } from "./FocusTrackEditorView";
import "./LevelEditorView.scss";
import { MagnetizationView } from "./magnetizationView/MagnetizationView";
import { MarkerEditorView } from "./MarkerEditorView";
import { NoteTrackEditorView } from "./NoteTrackEditorView";
import { TempoTrackEditorView } from "./TempoTrackEditorView";
import { TimeTransformView } from "./timeTransform/TimeTransformView";
import { LevelQueries } from "../../queries/level/LevelQueries";
import { useMutation } from "../../hooks/useMutation";
import { useNavigate } from "react-router-dom";
import { useToastManager } from "../../hooks/useToastManager";
import { Toast } from "../toast/Toast";
import { useShortcut } from "../../hooks/useShortcut";
import { Shortcuts } from "../../resources/shortcut/Shortcuts";
import { Toolbar } from "../toolbar/Toolbar";
import { FormInputField } from "../form/FormInputField";
import { usePopupManager } from "../../hooks/usePopupManager";
import { TapTempoPopup } from "./tapTempo/TapTempoPopup";
import { Slider } from "../slider/Slider";

function createToolbarTabs(editor: LevelEditor): Toolbar.Tab[] {
    return [
        Toolbar.Tab.create("File", [
            Toolbar.Item.shortcut("Save", Shortcuts.Save),
        ]),
        Toolbar.Tab.create("Playback", [
            Toolbar.Item.shortcut("Play / Pause", Shortcuts.Play),
            Toolbar.Item.shortcut("Reset", Shortcuts.Reset),
        ]),
        Toolbar.Tab.create("View", [
            Toolbar.Item.section("Windows", [
                Toolbar.Item.simple("Toggle mixer", () => {
                    editor.toggleMixer()
                }),
            ]),
        ])
    ]
}

export function LevelEditorView(props: {
    editor: LevelEditor
}) {
    const { level } = useComponent(props.editor)
    const { mutate: updateLevel, isLoading: isUpdating } = useMutation(LevelQueries.update)
    const navigate = useNavigate()
    const toastManager = useToastManager()
    const popupManager = usePopupManager()

    useShortcut(Shortcuts.Play, onPlay)
    useShortcut(Shortcuts.Save, onSave)
    useShortcut(Shortcuts.Reset, onReset)

    const toolbarTabs = useMemo(() => createToolbarTabs(props.editor), [props.editor])

    function onPlay() {
        if (props.editor.player.playing) {
            props.editor.player.pause()
            props.editor.player.seekToPreviousState()
        } else {
            props.editor.player.play()
        }
    }

    function onReset() {
        props.editor.player.reset()
    }

    function onSave() {
        if (isUpdating)
            return

        updateLevel(level.id, {
            name: level.name,
            serialized: JSON.stringify(level.serializeTracks()),
            duration: Math.round(level.durationInSeconds),
            playbackId: level.audioTrack.playbackId
        }).then(() => {
            toastManager.add(close => <Toast.Simple
                message="Level saved successfully"
                icon="check"
                close={close}
            />, 2000)
        })
    }

    function showMixer() {
        props.editor.toggleMixer()
    }

    function showTapTempo() {
        popupManager.add(close => <TapTempoPopup
            close={close}
            tempoTrack={props.editor.tempoTrack}
            player={props.editor.player}
        />)
    }

    function onBack() {
        navigate("/app")
    }

    return <div className="LevelEditorView">
        <div className="head grid gap-2 p-2">
            <Toolbar tabs={toolbarTabs} />
            <div className="flex gap-2 items-center">
                <Button
                    onClick={onBack}
                    shape="square"
                >
                    <Icon name="arrow_back" />
                </Button>

                <StringInput
                    value={level.name}
                    onChange={name => props.editor.setName(name)}
                />

                <PlayerControls player={props.editor.player} />

                <Button
                    onClick={showTapTempo}
                    shape="square"
                >
                    <Icon name="av_timer" />
                </Button>

                <Button
                    onClick={showMixer}
                    shape="square"
                >
                    <Icon name="instant_mix" />
                </Button>
            </div>
        </div>

        <SongEditorView editor={props.editor} />
    </div>
}

function PlayerControls(props: { player: EditorPlayer }) {
    const { engine } = useContext(EngineContext)
    const mixer = engine.getResource(Mixer)
    const { enabled } = useComponent(mixer.metronome)
    const { playing, speed } = useComponent(props.player)

    function onPlayPause() {
        if (playing) {
            props.player.pause()
            props.player.seekToPreviousState()
        } else {
            props.player.play()
        }
    }

    return <div className="PlayerControls flex gap-2 items-center">
        <Button
            onClick={onPlayPause}
            theme={ButtonTheme.Primary}
            shape="square"
        >
            <Icon
                name={playing ? "pause" : "play_arrow"}
            />
        </Button>

        <Button
            onClick={() => props.player.reset()}
            shape="square"
        >
            <Icon name="refresh" />
        </Button>

        <Button
            data-active={enabled}
            onClick={() => mixer.metronome.toggleEnabled()}
            theme={
                enabled ? ButtonTheme.Primary : ButtonTheme.Default
            }
        >
            Metronome {enabled ? "On" : "Off"}
        </Button>

        <div className="flex items-center gap-2 min-w-40">
            <span className="text-sm whitespace-nowrap">
                {speed.toFixed(2)}x
            </span>
            <Slider
                className="w-28"
                value={speed}
                min={0.5}
                max={1.5}
                step={0.05}
                onChange={value => { props.player.speed = value }}
            />
        </div>
    </div>
}

function SongEditorView(props: { editor: LevelEditor }) {

    function onEdit(pattern: TimedPattern) {
        props.editor.player.seekTicks(pattern.time)
        props.editor.editPattern(pattern)
    }

    return <div
        className="SongEditorView"
        onWheel={e => props.editor.timeTransform.handleWheel(e.nativeEvent, e.currentTarget)}
    >
        <div className="head">
            <FormInputField label="Magnetization" className="max-w-50">
                <MagnetizationView
                    transform={props.editor.timeTransform}
                />
            </FormInputField>
        </div>
        <div className="time">
            <TimeTransformView
                transform={props.editor.timeTransform}
                time={props.editor.player.time}
                player={props.editor.player}
            />
        </div>
        <div className="audio">
            <AudioTrackEditorView
                time={props.editor.player.time}
                tempoTrack={props.editor.tempoTrack}
                transform={props.editor.timeTransform}
                editor={props.editor.audioTrack}
                waveformRenderer={props.editor.audioWaveformRenderer}
            />
        </div>
        <div className="tempo">
            <TempoTrackEditorView
                time={props.editor.player.time}
                transform={props.editor.timeTransform}
                editor={props.editor.tempoTrack}
            />
        </div>
        <div className="markers">
            <MarkerEditorView
                time={props.editor.player.time}
                transform={props.editor.timeTransform}
                editor={props.editor.noteTrack}
            />
        </div>
        <div className="note">
            <NoteTrackEditorView
                onEdit={onEdit}
                time={props.editor.player.time}
                transform={props.editor.timeTransform}
                editor={props.editor.noteTrack}
            />
        </div>
        <div className="focus">
            <FocusTrackEditorView
                time={props.editor.player.time}
                transform={props.editor.timeTransform}
                editor={props.editor.focusTrack}
            />
        </div>
    </div>
}
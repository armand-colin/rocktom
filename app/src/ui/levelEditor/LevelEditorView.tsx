import { useComponent } from "@niloc/ecs-react";
import { useMemo } from "react";
import type { EditorPlayer } from "../../components/editor/EditorPlayer";
import { LevelEditor } from "../../components/editor/LevelEditor";
import type { TimedPattern } from "../../sound/song/Pattern";
import { Button, ButtonTheme } from "../button/Button";
import { FormInputField } from "../form/FormInputField";
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
import { usePopupManager } from "../../hooks/usePopupManager";
import { TapTempoPopup } from "./tapTempo/TapTempoPopup";
import { Slider } from "../slider/Slider";
import { Body } from "../../resources/queryClient/Body";

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
    const { mutate: updateLevel, isLoading: isUpdating } = useMutation(LevelQueries.update.run)
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

        updateLevel({
            path: { id: level.id },
            body: Body.json({
                name: level.name,
                serialized: JSON.stringify(level.serializeTracks()),
                duration: Math.round(level.durationInSeconds),
                playbackId: level.audioTrack.playbackId,
                instrumentTypes: level.getInstrumentTypes(),
            })
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

                <PlayerControls
                    player={props.editor.player}
                />

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

        <LevelEditorTracksView editor={props.editor} />
    </div>
}

function PlayerControls(props: { player: EditorPlayer }) {
    const { playing } = useComponent(props.player)

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
    </div>
}

function LevelEditorTracksView(props: { editor: LevelEditor }) {
    const { noteTracks } = useComponent(props.editor)

    function onEdit(pattern: TimedPattern) {
        props.editor.player.seekTicks(pattern.time)
        props.editor.editPattern(pattern)
    }

    return <div
        className="LevelEditorTracksView"
        onWheel={e => props.editor.timeTransform.handleWheel(e.nativeEvent, e.currentTarget)}
    >
        <div className="head">
            <FormInputField label="Magnetization" className="max-w-50 flex-1">
                <MagnetizationView
                    transform={props.editor.timeTransform}
                />
            </FormInputField>
            <FormInputField label="Playback speed">
                <PlaybackSpeedSlider
                    player={props.editor.player}
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
            {noteTracks[0] && (
                <MarkerEditorView
                    time={props.editor.player.time}
                    transform={props.editor.timeTransform}
                    editor={noteTracks[0]}
                />
            )}
        </div>
        {noteTracks.map(editor => (
            <div className="note" key={editor.track.id}>
                <NoteTrackEditorView
                    onEdit={onEdit}
                    time={props.editor.player.time}
                    transform={props.editor.timeTransform}
                    trackEditor={editor}
                    canRemove={noteTracks.length > 1}
                    onRemove={() => props.editor.removeNoteTrack(editor.track.id)}
                    editor={props.editor}
                />
            </div>
        ))}
        <div className="focus">
            <FocusTrackEditorView
                time={props.editor.player.time}
                transform={props.editor.timeTransform}
                editor={props.editor.focusTrack}
            />
        </div>
    </div>
}

function PlaybackSpeedSlider(props: { player: EditorPlayer }) {
    const { speed } = useComponent(props.player)

    return <div className="grid gap-05">
        <span className="text-body-xs">{speed.toFixed(2)}x</span>
        <Slider
            className="w-28"
            value={speed}
            min={0.5}
            max={1.5}
            step={0.05}
            onChange={value => { props.player.speed = value }}
        />
    </div >
}
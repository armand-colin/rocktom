import { EngineContext, useComponent } from "@niloc/ecs-react";
import { useContext, useEffect, useState } from "react";
import type { EditorPlayer } from "../../components/editor/EditorPlayer";
import type { LevelEditor } from "../../components/editor/LevelEditor";
import { Input, InputManager } from "../../resources/InputManager";
import { Mixer } from "../../resources/Mixer";
import { WindowManager } from "../../resources/WindowManager";
import type { TimedPattern } from "../../sound/song/Pattern";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { StringInput } from "../input/StringInput";
import { MixerView } from "../mixerView/MixerView";
import { AudioTrackEditorView } from "./AudioTrackEditorView";
import { FocusTrackEditorView } from "./FocusTrackEditorView";
import "./LevelEditorView.scss";
import { MagnetizationView } from "./magnetizationView/MagnetizationView";
import { NoteTrackEditorView } from "./NoteTrackEditorView";
import { TempoTrackEditorView } from "./TempoTrackEditorView";
import { TimeTransformView } from "./timeTransform/TimeTransformView";
import { LevelQueries } from "../../queries/level/LevelQueries";
import { useMutation } from "../../hooks/useMutation";
import { useNavigate } from "react-router-dom";

export function LevelEditorView(props: { editor: LevelEditor }) {
    const { engine } = useContext(EngineContext)
    const inputManager = engine.getResource(InputManager)
    const windowManager = engine.getResource(WindowManager)
    const { level } = useComponent(props.editor)
    const { mutate: updateLevel } = useMutation(LevelQueries.update)
    const navigate = useNavigate()

    useEffect(() => {
        function onPlay() {
            if (props.editor.player.playing) {
                props.editor.player.pause()
                props.editor.player.seekToPreviousState()
            } else {
                props.editor.player.play()
            }
        }

        inputManager.register(Input.Play, onPlay)

        return () => {
            inputManager.unregister(Input.Play, onPlay)
        }
    }, [])

    function showMixer() {
        windowManager.add(
            { name: "Mixer", id: "mixer" },
            () => <MixerView />
        )
    }

    function onSave() {
        updateLevel(level.id, {
            name: level.name,
            serialized: JSON.stringify(level.serializeTracks())
        })
    }

    function onBack() {
        navigate("/app")
    }

    return <div className="LevelEditorView">
        <div className="head">
            <Button onClick={onBack}>Back</Button>
            <LevelName
                name={level.name}
                onChange={name => props.editor.setName(name)}
            />
            <Button onClick={onSave}>Save</Button>
            <PlayerControls player={props.editor.player} />
            <Button onClick={showMixer} ><Icon name="instant_mix" /></Button>
            <SongEditorView editor={props.editor} />
        </div>
    </div>
}

function LevelName(props: { name: string, onChange: (name: string) => void }) {
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(props.name)

    useEffect(() => {
        setName(props.name)
    }, [props.name])

    return <div className="LevelName">
        {
            editing ?
                <StringInput
                    value={name}
                    name="level-name"
                    onChange={setName}
                    autoFocus
                    onBlur={() => {
                        props.onChange(name)
                        setEditing(false)
                    }}
                /> :
                <p onDoubleClick={() => setEditing(true)}>{props.name}</p>
        }
    </div>
}


function PlayerControls(props: { player: EditorPlayer }) {
    const { engine } = useContext(EngineContext)
    const mixer = engine.getResource(Mixer)
    const { enabled } = useComponent(mixer.metronome)

    return <div className="PlayerControls">
        <Button onClick={() => props.player.play()}>Play</Button>
        <Button onClick={() => props.player.pause()}>Pause</Button>
        <Button onClick={() => props.player.reset()}>Reset</Button>
        <Button data-active={enabled} onClick={() => mixer.metronome.toggleEnabled()}><Icon name="acute" /></Button>
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
            <MagnetizationView
                transform={props.editor.timeTransform}
            />
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
import { EngineContext, useComponent } from "@niloc/ecs-react";
import { useContext, useEffect } from "react";
import type { Playback } from "../components/Playback";
import { Renderer } from "../resources/Renderer";
import { ElementRenderer } from "./ElementRenderer";
import "./PlaybackView.scss";
import { LiveInstrumentView } from "./liveInstrument/LiveInstrumentView";
import { Slider } from "./slider/Slider";
import { Icon } from "./icon/Icon";
import { InputIcon } from "./inputIcon/InputIcon";
import { Input, InputManager } from "../resources/InputManager";
import { Toggle } from "./toggle/Toggle";
import { Tempo } from "../sound/Tempo";
import { PlaybackProgressView } from "./PlaybackProgressView";
import type { Time } from "../components/Time";
import { Mixer } from "../resources/Mixer";
import { useNavigate } from "react-router-dom";
import { InactiveHider } from "./inactiveHider/InactiveHider";

export function PlaybackView(props: { playback: Playback }) {
    const { engine } = useContext(EngineContext)
    const renderer = engine.getResource(Renderer)
    const inputManager = engine.getResource(InputManager)

    const { playing } = useComponent(props.playback)

    useEffect(() => {
        function onPlay() {
            if (props.playback.playing)
                props.playback.pause()
            else
                props.playback.play()
        }

        function onReset() {
            props.playback.reset()
        }

        inputManager.register(Input.Play, onPlay)
        inputManager.register(Input.Reset, onReset)

        return () => {
            inputManager.unregister(Input.Play, onPlay)
            inputManager.unregister(Input.Reset, onReset)
        }
    }, [])

    return <div className="PlaybackView">
        <div className="canvas">
            <ElementRenderer element={renderer.element} />
        </div>

        <PlaybackControls playback={props.playback} />
        {
            playing ?
                undefined :
                <PlaybackProgressView playback={props.playback} />
        }
        <LiveInstrumentView />
    </div>
}

function PlaybackControls(props: { playback: Playback }) {
    const { engine } = useContext(EngineContext)
    const mixer = engine.getResource(Mixer)
    const navigate = useNavigate()

    const { playing } = useComponent(props.playback)
    const { enabled: metronomeEnabled, volume: metronomeVolume } = useComponent(mixer.metronome)

    return (
        <div className="PlaybackControls">
            <h1>{props.playback.level.name}</h1>

            <div className="buttons">
                <PlayButton playback={props.playback} />
                <ResetButton playback={props.playback} />
            </div>

            <InactiveHider enabled={playing}>
                <YoutubeVolumeSlider playback={props.playback} />

                <div className="speed">
                    <p>Playback speed</p>

                    <div className="container">
                        <PlaybackSpeedButton playback={props.playback} value={1.0} />
                        <PlaybackSpeedButton playback={props.playback} value={0.9} />
                        <PlaybackSpeedButton playback={props.playback} value={0.8} />
                        <PlaybackSpeedButton playback={props.playback} value={0.7} />
                    </div>
                </div>

                <div className="metronome">
                    <label>
                        Metronome <Toggle
                            value={metronomeEnabled}
                            onChange={v => mixer.metronome.setEnabled(v)}
                        />
                    </label>
                    <Slider
                        min={0}
                        max={1}
                        value={metronomeVolume}
                        onChange={v => mixer.metronome.setVolume(v)}
                        disabled={!metronomeEnabled}
                    />
                </div>

                <div className="time">
                    <PlaybackTimeView time={props.playback.time} />
                </div>
            </InactiveHider>

            <button
                className="BackButton"
                onClick={() => navigate("/app")}
            >
                <Icon name="arrow_back" /> Back to level selection
            </button>
        </div>
    );
}

function floatsEqual(a: number, b: number, epsilon = 0.0001) {
    return Math.abs(a - b) < epsilon
}

function PlaybackSpeedButton(props: { playback: Playback, value: number }) {
    const { speed } = useComponent(props.playback)

    return <button
        className="PlaybackSpeedButton"
        data-active={floatsEqual(props.value, speed)}
        onClick={() => props.playback.speed = props.value}
    >
        {props.value * 100}%
    </button>
}

function PlayButton(props: { playback: Playback }) {
    const { loading, playing } = useComponent(props.playback)

    function onClick() {
        if (props.playback.playing)
            props.playback.pause()
        else
            props.playback.play()
    }

    return <button
        className="PlayButton"
        onClick={onClick}
        disabled={loading}
    >
        {playing ? "PAUSE" : "PLAY"} <InputIcon input={Input.Play} />
    </button>
}

function ResetButton(props: { playback: Playback }) {
    return <button
        className="ResetButton"
        onClick={() => props.playback.reset()}
    >
        RESET <InputIcon input={Input.Reset} />
    </button>
}

function YoutubeVolumeSlider(props: { playback: Playback }) {
    const { audioVolume } = useComponent(props.playback)

    return <div className="YoutubeVolumeSlider">
        <Icon name="volume_up" />
        <small>{(audioVolume * 100) | 0}%</small>
        <Slider
            min={0}
            max={1}
            value={audioVolume}
            onChange={v => { props.playback.audioVolume = v }}
        />
    </div>
}

function PlaybackTimeView(props: { time: Time }) {
    const time = useComponent(props.time)

    const minutes = (time.seconds / 60) | 0
    const milliseconds = ((time.seconds * 1000) % 1000) | 0
    const seconds = (time.seconds % 60) | 0

    const beats = (time.ticks / Tempo.bars(1)) | 0
    const quarterNotes = (time.ticks % Tempo.bars(1)) | 0

    return <div className="PlaybackTimeView">
        <p>
            <span>{minutes.toString().padStart(2, '0')}:</span>
            <span>{seconds.toString().padStart(2, '0')}.</span>
            <span>{milliseconds.toString().padStart(3, '0')}</span>
        </p>
        <p>{time.ticks}</p>
        <p>
            <span>{time.tempo.bpm} BPM</span>
            <span>{beats}</span> :
            <span>{quarterNotes.toString().padStart(2, '0')}</span>
        </p>
    </div>
}
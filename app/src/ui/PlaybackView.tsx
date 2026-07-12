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
import type { DeltaTime } from "../components/DeltaTime";

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

        <InactiveHider enabled={playing} timeout={3000}>
            <PlaybackProgressView playback={props.playback} />
        </InactiveHider>

        {/* <LiveInstrumentView /> */}
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
            <button
                className="BackButton"
                onClick={() => navigate("/app")}
            >
                <Icon name="arrow_back" /> Back to level selection
            </button>

            <h1>{props.playback.level.name}</h1>

            <div className="buttons">
                <PlayButton playback={props.playback} />
                <ResetButton playback={props.playback} />
            </div>

            <InactiveHider enabled={playing} timeout={3000}>
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
                    <DeltaTimeView deltaTime={props.playback.deltaTime} />
                    <PlaybackTimeView time={props.playback.time} />
                </div>
            </InactiveHider>
        </div>
    );
}

function DeltaTimeView(props: { deltaTime: DeltaTime }) {
    const { deltaTime } = useComponent(props.deltaTime)
    return <p>delta : {(deltaTime * 1000) | 0}ms</p>
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

function formatPlaybackTime(seconds: number): string {
    const minutes = (seconds / 60) | 0
    const wholeSeconds = (seconds % 60) | 0
    const centiseconds = ((seconds * 100) % 100) | 0

    return `${minutes.toString().padStart(2, '0')}:${wholeSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
}

function PlaybackTimeView(props: { time: Time }) {
    const time = useComponent(props.time)

    const bars = (time.ticks / Tempo.bars(1)) | 0
    const beatInBar = (time.ticks % Tempo.bars(1)) / Tempo.PPQ

    return <div className="PlaybackTimeView">
        <div className="field">
            <span className="label">Time</span>
            <span className="value">{formatPlaybackTime(time.seconds)}</span>
        </div>
        <div className="field">
            <span className="label">Ticks</span>
            <span className="value">{time.ticks}</span>
        </div>
        <div className="field">
            <span className="label">Tempo</span>
            <span className="value">{time.tempo.bpm} BPM</span>
        </div>
        <div className="field">
            <span className="label">Bar</span>
            <span className="value">{bars} : {beatInBar.toFixed(1)}</span>
        </div>
    </div>
}
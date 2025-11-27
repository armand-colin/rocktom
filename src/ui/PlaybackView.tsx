import { EngineContext, useComponent, useResource } from "@niloc/ecs-react";
import { useContext } from "react";
import type { Playback } from "../components/Playback";
import { Player } from "../resources/Player";
import { Renderer } from "../resources/Renderer";
import { ElementRenderer } from "./ElementRenderer";
import "./PlaybackView.scss";
import { LiveInstrumentView } from "./liveInstrument/LiveInstrumentView";
import { Slider } from "./slider/Slider";
import { Icon } from "./icon/Icon";
import { InputIcon } from "./inputIcon/InputIcon";
import { Input } from "../resources/InputManager";
import { Toggle } from "./toggle/Toggle";
import type { PlaybackTime } from "../components/PlaybackTime";
import { Tempo } from "../sound/Tempo";
import { PlaybackProgressView } from "./PlaybackProgressView";

export function PlaybackView(props: { playback: Playback }) {
    const { engine } = useContext(EngineContext)
    const renderer = engine.getResource(Renderer)
    const { isPlaying } = useResource(Player)

    return <div className="PlaybackView">
        <div className="canvas">
            <ElementRenderer element={renderer.element} />
        </div>

        <PlaybackControls playback={props.playback} />
        {
            isPlaying ?
                undefined :
                <PlaybackProgressView playback={props.playback} />
        }
        <LiveInstrumentView />
    </div>
}

function PlaybackControls(props: { playback: Playback }) {
    const { engine } = useContext(EngineContext)
    const player = engine.getResource(Player)
    const { metronomeEnabled, metronomeVolume } = useComponent(props.playback)
    const { isPlaying } = useResource(Player)

    return (
        <div className="PlaybackControls">
            <h1>{props.playback.level.name}</h1>
            <h2>by {props.playback.level.author}</h2>

            <div className="buttons">
                <PlayButton playback={props.playback} />
                <ResetButton />
            </div>

            {
                !isPlaying ?
                    <>

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
                                    onChange={v => { props.playback.metronomeEnabled = v }}
                                />
                            </label>
                            <Slider
                                min={0}
                                max={1}
                                value={metronomeVolume}
                                onChange={v => { props.playback.metronomeVolume = v }}
                                disabled={!metronomeEnabled}
                            />
                        </div>

                        <div className="time">
                            <PlaybackTimeView time={props.playback.playbackTime} />
                        </div>

                    </> :
                    undefined
            }

            <button
                className="BackButton"
                onClick={() => player.clear()}
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
    const player = useResource(Player)
    const { loading } = useComponent(props.playback)

    function onClick() {
        if (player.isPlaying)
            player.pause()
        else
            player.play()
    }

    return <button
        className="PlayButton"
        onClick={onClick}
        disabled={loading}
    >
        {player.isPlaying ? "PAUSE" : "PLAY"} <InputIcon input={Input.Play} />
    </button>
}

function ResetButton() {
    const player = useResource(Player)
    return <button
        className="ResetButton"
        onClick={() => player.reset()}
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

function PlaybackTimeView(props: { time: PlaybackTime }) {
    const { time, ticks, tempo } = useComponent(props.time)

    const minutes = (time / 60) | 0
    const seconds = (time % 60) | 0
    const milliseconds = ((time * 1000) % 1000) | 0

    const beats = (ticks / Tempo.bars(1)) | 0
    const quarterNotes = (ticks % Tempo.bars(1)) | 0

    return <div className="PlaybackTimeView">
        <p>
            <span>{minutes.toString().padStart(2, '0')}:</span>
            <span>{seconds.toString().padStart(2, '0')}.</span>
            <span>{milliseconds.toString().padStart(3, '0')}</span>
        </p>
        <p>{ticks}</p>
        <p>
            <span>{tempo.bpm} BPM</span>
            <span>{beats}</span> :
            <span>{quarterNotes.toString().padStart(2, '0')}</span>
        </p>
    </div>
}
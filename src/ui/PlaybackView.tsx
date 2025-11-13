import { EngineContext, useComponent, useResource } from "@niloc/ecs-react";
import { useContext, type ChangeEvent } from "react";
import type { Playback } from "../components/Playback";
import { Player } from "../resources/Player";
import { Renderer } from "../resources/Renderer";
import { ElementRenderer } from "./ElementRenderer";
import "./PlaybackView.scss";
import { LiveInstrumentView } from "./liveInstrument/LiveInstrumentView";

export function PlaybackView(props: { playback: Playback }) {
    const { engine } = useContext(EngineContext)
    const renderer = engine.getResource(Renderer)

    return <div className="PlaybackView">
        <div className="canvas">
            <ElementRenderer element={renderer.element} />
        </div>

        <PlaybackControls playback={props.playback} />
        <LiveInstrumentView />
    </div>
}

function PlaybackControls(props: { playback: Playback }) {
    const { engine } = useContext(EngineContext)
    const player = engine.getResource(Player)

    return (
        <div className="PlaybackControls">
            <h1>{props.playback.level.name}</h1>
            <h2>by {props.playback.level.author}</h2>

            <div className="buttons">
                <PlayButton />
                <ResetButton />
            </div>

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

            <button className="BackButton" onClick={() => player.clear()}>Back to song list</button><br />
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

function PlayButton() {
    const player = useResource(Player)

    function onClick() {
        if (player.isPlaying)
            player.pause()
        else
            player.play()
    }

    return <button className="PlayButton" onClick={onClick}>{player.isPlaying ? "PAUSE" : "PLAY"} [SPACE]</button>
}

function ResetButton() {
    const player = useResource(Player)

    return <button className="ResetButton" onClick={() => player.reset()}>RESET [R]</button>
}

function YoutubeVolumeSlider(props: { playback: Playback }) {
    const { youtubeVolume } = useComponent(props.playback)

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        const value = parseFloat(event.target.value)
        props.playback.youtubeVolume = value
    }

    return <div className="YoutubeVolumeSlider">
        <label>Volume</label>
        <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={youtubeVolume}
            onChange={onChange}
        />
    </div>
}
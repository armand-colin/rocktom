import { EngineContext, useResource } from "@niloc/ecs-react";
import { useContext } from "react";
import type { Playback } from "../components/Playback";
import { Player } from "../resources/Player";
import { Renderer } from "../resources/Renderer";
import { ElementRenderer } from "./ElementRenderer";
import "./PlaybackView.scss";

export function PlaybackView(props: { playback: Playback }) {
    const { engine } = useContext(EngineContext)
    const renderer = engine.getResource(Renderer)

    return <div className="PlaybackView">
        <div className="canvas">
            <ElementRenderer element={renderer.element} />
        </div>

        <PlaybackControls playback={props.playback} />
    </div>
}

function PlaybackControls(props: { playback: Playback }) {
    const player = useResource(Player)

    return (
        <div className="PlaybackControls">
            <button onClick={() => player.play()}>Play</button>
            <button onClick={() => player.pause()}>Pause</button>
            <button onClick={() => player.reset()}>Reset</button>

            <button onClick={() => player.clear()}>Back to song list</button>
        </div>
    );
}
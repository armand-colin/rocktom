import type { Playback } from "../components/Playback";
import { Player } from "../resources/Player";
import "./PlaybackView.scss"
import { useResource } from "@niloc/ecs-react";

export function PlaybackView(props: { playback: Playback }) {
    const player = useResource(Player)

    return <div
        className="PlaybackView"
    >
        <button onClick={() => player.play()}>play</button>
        <button onClick={() => player.pause()}>pause</button>
        <button onClick={() => player.reset()}>reset</button>

        <p>{player.time.toFixed(2)}</p>
    </div>
}
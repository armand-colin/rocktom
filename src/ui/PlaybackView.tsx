import type { CSSProperties } from "react";
import type { Playback } from "../components/Playback";
import { useComponent, useResource } from "../engine/hooks";
import { Player } from "../resources/Player";
import "./PlaybackView.scss"
import { PlaybackPlayView } from "./PlaybackPlayView";

export function PlaybackView(props: { playback: Playback }) {
    const player = useResource(Player)
    const { plays, ticksPerSecond } = useComponent(props.playback)

    return <div
        className="PlaybackView"
        style={{
            "--player-time": player.time,
            "--ticks-per-second": ticksPerSecond
        } as CSSProperties}
    >
        <button onClick={() => player.play()}>play</button>
        <button onClick={() => player.pause()}>pause</button>
        <button onClick={() => player.reset()}>reset</button>

        <p>{player.time.toFixed(2)}</p>

        <div className="view">
            <div className="neck"></div>

            <div className="plays">
                {
                    plays.map((note, i) => <PlaybackPlayView 
                        key={i}
                        play={note}
                    />)
                }
            </div>
        </div>
    </div>
}
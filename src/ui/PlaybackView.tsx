import type { CSSProperties } from "react";
import type { Playback } from "../components/Playback";
import { useComponent, useResource } from "../engine/hooks";
import { Player } from "../resources/Player";
import "./PlaybackView.scss"
import { Bass } from "../sound/Bass";

const STRINGS = [
    "E",
    "A",
    "D",
    "G"
]

export function PlaybackView(props: { playback: Playback }) {
    const player = useResource(Player)
    const { notes, ticksPerSecond } = useComponent(props.playback)

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
            <div className="neck">
                <div className="string" data-string={STRINGS[0]}></div>
                <div className="string" data-string={STRINGS[1]}></div>
                <div className="string" data-string={STRINGS[2]}></div>
                <div className="string" data-string={STRINGS[3]}></div>
            </div>
            <div className="notes">
                {
                    notes.map((note, i) => <div
                        key={i}
                        data-string={STRINGS[note.stringIndex]}
                        className="note"
                        style={{
                            "--time": note.time,
                            "--duration": note.duration,
                            "--string-index": note.stringIndex,
                            "--fret-number": Bass.getFretNumber(note.noteNumber, note.stringIndex),
                        } as CSSProperties}
                    >{Bass.getFretNumber(note.noteNumber, note.stringIndex)}</div>)
                }
            </div>
        </div>
    </div>
}
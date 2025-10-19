import type { CSSProperties } from "react";
import type { PlaybackPlay } from "../components/Playback";
import { Bass } from "../sound/Bass";
import "./PlaybackPlayView.scss"

export function PlaybackPlayView(props: { play: PlaybackPlay }) {
    return <div
        className="PlaybackPlayView"
        style={{
            "--time": props.play.time
        } as CSSProperties}
    >
        {
            props.play.notes.map((note, i) => <div
                key={i}
                className="note"
                data-string={Bass.getStringName(note.stringIndex)}
                style={{
                    "--string-index": note.stringIndex,
                    "--fret-number": note.fretNumber,
                    "--duration": note.duration
                } as CSSProperties}
            >
                <div className="body"></div>
                <div className="head">{note.fretNumber}</div>
            </div>)
        }
    </div>
}
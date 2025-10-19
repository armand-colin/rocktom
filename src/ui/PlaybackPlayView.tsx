import type { CSSProperties } from "react";
import type { PlaybackPlay } from "../components/Playback";
import "./PlaybackPlayView.scss";

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
                data-string={note.string.name}
                style={{
                    "--string-index": note.string.index,
                    "--fret-number": note.fret,
                    "--duration": note.duration
                } as CSSProperties}
            >
                <div className="body"></div>
                <div className="head">{note.fret}</div>
            </div>)
        }
    </div>
}
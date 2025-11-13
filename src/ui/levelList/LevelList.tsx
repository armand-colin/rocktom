import type { Level } from "../../sound/Level";
import { LiveInstrumentView } from "../liveInstrument/LiveInstrumentView";
import "./LevelList.scss";

function formatSeconds(seconds: number) {
    const minutes = (seconds / 60) | 0
    const secs = (seconds % 60) | 0
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}
export function LevelList(props: { levels: Level[], onSelect: (level: Level) => void }) {
    return <div className="LevelList">
        <h1>Rocktom</h1>
        <h2>List of available songs</h2>

        <ul>
            {
                props.levels.map((level, i) => (
                    <li
                        key={i}
                        onClick={() => props.onSelect(level)}
                    >
                        <p>{level.name} by {level.author}</p>
                        <small>{formatSeconds(level.durationInSeconds | 0)}</small>
                    </li>
                ))
            }
        </ul>

        <LiveInstrumentView />
    </div>
}
import type { Level } from "../../sound/Level";
import "./LevelList.scss";

export function LevelList(props: { levels: Level[], onSelect: (level: Level) => void }) {
    return <div className="LevelList">
        <ul>
            {
                props.levels.map((level, i) => (
                    <li
                        key={i}
                        onClick={() => props.onSelect(level)}
                    >
                        <p>{level.name}</p>
                        <small>{level.durationInSeconds | 0}</small>
                    </li>
                ))
            }
        </ul>
    </div>
}
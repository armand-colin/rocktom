import type { Level } from "./sound/Level";

export function LevelList(props: { levels: Level[], onSelect: (level: Level) => void }) {
    return <div className="LevelList">
        <ul>
            {
                props.levels.map((level, i) => (
                    <li
                        key={i}
                        onClick={() => props.onSelect(level)}
                    >
                        {level.name}
                    </li>
                ))
            }
        </ul>
    </div>
}
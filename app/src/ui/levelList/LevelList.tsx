import { Button } from "../button/Button";
import "./LevelList.scss";
import type { LevelEntity } from "../../queries/level/LevelEntity";

function formatSeconds(seconds: number) {
    const minutes = (seconds / 60) | 0
    const secs = (seconds % 60) | 0
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function LevelList(props: {
    levels: LevelEntity[],
    onSelect: (level: LevelEntity) => void,
    onEdit: (level: LevelEntity) => void,
    onCreate: () => void
}) {
    return <ul className="LevelList">
        {
            props.levels.map((level) => (
                <li
                    key={level.id}
                    onClick={() => props.onSelect(level)}
                >
                    <p>{level.name}</p>
                    <small>{formatSeconds(level.duration)}</small>

                    <Button onClick={(e) => {
                        e.stopPropagation()
                        props.onEdit(level)
                    }}>
                        Edit
                    </Button>
                </li>
            ))
        }
    </ul>
}
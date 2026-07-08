import { useResource } from "@niloc/ecs-react";
import type { MouseEvent } from "react";
import { Button, ButtonTheme } from "../button/Button";
import { Icon } from "../icon/Icon";
import { UiSize } from "../UiSize";
import { ContextualMenu } from "../../resources/ContextualMenu";
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
    const contextualMenu = useResource(ContextualMenu)

    function openLevelMenu(e: MouseEvent, level: LevelEntity) {
        contextualMenu.open(e.nativeEvent, [
            {
                label: "Edit",
                icon: "edit",
                action: () => props.onEdit(level),
            },
        ])
    }

    return <ul className="LevelList">
        {
            props.levels.map((level) => (
                <li
                    key={level.id}
                    onContextMenu={e => openLevelMenu(e, level)}
                >
                    <div className="LevelList-info">
                        <p className="LevelList-name">{level.name}</p>
                        <small className="LevelList-duration">
                            <span className="LevelList-durationLabel">Duration</span>
                            {formatSeconds(level.duration)}
                        </small>
                    </div>

                    <div className="LevelList-actions">
                        <Button
                            size={UiSize.S}
                            onClick={() => props.onEdit(level)}
                        >
                            <Icon name="edit" />
                            Edit
                        </Button>
                        <Button
                            className="LevelList-playButton"
                            size={UiSize.M}
                            shape="square"
                            theme={ButtonTheme.Primary}
                            onClick={() => props.onSelect(level)}
                        >
                            <Icon name="play_arrow" />
                        </Button>
                    </div>
                </li>
            ))
        }
    </ul>
}
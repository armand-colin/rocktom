import type { MouseEvent } from "react";
import { Button, ButtonTheme, ButtonVariant } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { UiSize } from "../../UiSize";
import type { LevelEntity } from "../../../queries/level/LevelEntity";
import "./LevelListItem.scss";
import { InstrumentType } from "../../../sound/instrument/Instrument";
import { LevelInstrumentsView } from "../LevelInstrumentsView";

type Props = {
    level: LevelEntity;
    onSelect: (level: LevelEntity) => void;
    onMenuOpen: (e: MouseEvent, level: LevelEntity) => void;
    className?: string;
    hideMenu?: boolean
};

function formatSeconds(seconds: number) {
    const minutes = (seconds / 60) | 0
    const secs = (seconds % 60) | 0
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function LevelListItem(props: Props) {
    const { level } = props

    return (
        <li
            className={`LevelListItem ${props.className}`}
            onContextMenu={e => {
                if (!props.hideMenu) {
                    props.onMenuOpen(e, level)
                }
            }}
        >
            <div className="LevelListItem-info">
                <div className="name">
                    <p className="truncate">{level.name}</p>
                    <LevelInstrumentsView
                        instrumentTypes={level.instrumentTypes.filter(InstrumentType.is)}
                    />
                </div>
                <small className="LevelListItem-duration">
                    <span className="LevelListItem-durationLabel">Duration</span>
                    {formatSeconds(level.duration)}
                </small>
            </div>

            <div className="LevelListItem-actions">
                {
                    !props.hideMenu && <Button
                        size={UiSize.S}
                        onClick={(e) => props.onMenuOpen(e, level)}
                        shape="square"
                        variant={ButtonVariant.Ghost}
                    >
                        <Icon name="more_vert" />
                    </Button>
                }
                <Button
                    className="LevelListItem-playButton"
                    size={UiSize.M}
                    shape="square"
                    theme={ButtonTheme.Primary}
                    onClick={() => props.onSelect(level)}
                >
                    <Icon name="play_arrow" />
                </Button>
            </div>
        </li >
    )
}
import type { MouseEvent } from "react";
import { Button, ButtonTheme } from "../button/Button";
import { Icon } from "../icon/Icon";
import { UiSize } from "../UiSize";
import type { LevelEntity } from "../../queries/level/LevelEntity";
import "./LevelListItem.scss";
import { InstrumentType } from "../../sound/instrument/Instrument";

type Props = {
    level: LevelEntity;
    onSelect: (level: LevelEntity) => void;
    onMenuOpen: (e: MouseEvent, level: LevelEntity) => void;
    className?: string;
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
            onContextMenu={e => props.onMenuOpen(e, level)}
        >
            <div className="LevelListItem-info">
                <div className="name">
                    <p className="truncate">{level.name}</p>
                    <LevelInstruments instrumentTypes={level.instrumentTypes} />
                </div>
                <small className="LevelListItem-duration">
                    <span className="LevelListItem-durationLabel">Duration</span>
                    {formatSeconds(level.duration)}
                </small>
            </div>

            <div className="LevelListItem-actions">
                <Button
                    size={UiSize.S}
                    onClick={(e) => props.onMenuOpen(e, level)}
                    shape="square"
                    theme={ButtonTheme.Ghost}
                >
                    <Icon name="more_vert" />
                </Button>
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

function LevelInstruments(props: { instrumentTypes: string[] }) {
    const instrumentTypes = props.instrumentTypes.map(type => InstrumentType.all.find(instrumentType => instrumentType === type))
        .filter(instrumentType => instrumentType !== undefined)

    return <span className="LevelInstruments">
        {
            instrumentTypes.map(type => <span
                key={type}
                data-type={type}
            >
                {InstrumentType.getLabel(type)}
            </span>)
        }
    </span>
}
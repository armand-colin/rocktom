import type { MouseEvent } from "react";
import { Button, ButtonVariant } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { UiSize } from "../../UiSize";
import { LevelEntity } from "../../../queries/level/LevelEntity";
import "./LevelListItem.scss";
import { InstrumentType } from "../../../sound/instrument/Instrument";
import { LevelInstrumentsView } from "../LevelInstrumentsView";
import { Card } from "../../button/Card";

type Props = {
    level: LevelEntity;
    onSelect: (level: LevelEntity) => void;
    onMenuOpen: (e: MouseEvent, level: LevelEntity) => void;
    className?: string;
    hideMenu?: boolean;
    isShared?: boolean;
};

function formatSeconds(seconds: number) {
    const minutes = (seconds / 60) | 0
    const secs = (seconds % 60) | 0
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function LevelListItem(props: Props) {
    const { level } = props

    return (
        <Card
            primitive="li"
            className={`LevelListItem ${props.className}`}
            onContextMenu={e => {
                if (!props.hideMenu) {
                    props.onMenuOpen(e, level)
                }
            }}
            containerClassName="LevelListItemContainer"
            onClick={() => props.onSelect(level)}
            fixtures={props.hideMenu ? null : <div className="LevelListItemFixtures">
                <Button
                    size={UiSize.S}
                    onClick={(e) => props.onMenuOpen(e, level)}
                    shape="square"
                    variant={ButtonVariant.Ghost}
                >
                    <Icon name="more_vert" />
                </Button>
            </div>}
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
                {
                    props.isShared && props.level.share ?
                        <small className="text-grey-300 text-body-xs">
                            by <i>{props.level.user.name}</i>
                            {
                                props.level.share.permission === LevelEntity.SharePermission.Write ?
                                    <span className="ml-2 text-blue-300">can write</span> :
                                    null
                            }
                        </small> :
                        null
                }
            </div>
        </Card>
    )
}
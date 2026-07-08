import "./Icon.scss";

export type IconName =
    "home" |
    "volume_up" |
    "volume_off" |
    "space_bar" |
    "shift" |
    "arrow_back" |
    "code" |
    "arrow_drop_down" |
    "close" |
    "acute" |
    "instant_mix" |
    "progress_activity"

type Props = {
    name: IconName
}

export function Icon(props: Props) {
    return <i 
        className="Icon"
        data-icon={props.name}
    >
        {props.name}
    </i>
}
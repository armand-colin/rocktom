import "./Icon.scss";

export type IconName = "home" | "volume_up" | "volume_off" | "space_bar" | "shift" | "arrow_back"

type Props = {
    name: IconName
}

export function Icon(props: Props) {
    return <i className="Icon">{props.name}</i>
}
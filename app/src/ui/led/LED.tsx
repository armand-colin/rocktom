import "./LED.scss";

type Props = {
    theme?: "default" | "error" | "primary"
}

export function LED(props: Props) {
    return <div
        className="LED"
        data-theme={props.theme ?? "default"}
    >
    </div>
}
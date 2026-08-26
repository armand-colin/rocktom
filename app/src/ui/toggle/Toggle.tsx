import "./Toggle.scss"

type Props = {
    value: boolean | null,
    onChange: (value: boolean) => void,
    className?: string,
}

export function Toggle(props: Props) {
    return <div
        className={"Toggle " + (props.className ?? "")}
        onClick={() => props.onChange(!(props.value === true))}
        data-active={props.value === true}
        data-unknown={props.value === null}
    >
        <div className="knob"></div>
    </div>
}

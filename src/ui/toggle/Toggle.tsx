import "./Toggle.scss"

type Props= {
    value: boolean,
    onChange: (value: boolean) => void,
    className?: string,
}

export function Toggle(props: Props) {
    return <div 
        className={"Toggle " + (props.className ?? "")} 
        onClick={() => props.onChange(!props.value)}
        data-active={props.value}
    >
        <div className="knob"></div>
    </div>
}
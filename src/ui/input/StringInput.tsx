import "./StringInput.scss"

type Props = {
    name: string,
    value: string,
    onChange: (value: string) => void,
    autoFocus?: boolean,
    onBlur?: () => void,
}

export function StringInput(props: Props) {
    return <div className="StringInput">
        <input
            type="text"
            value={props.value}
            onChange={e => props.onChange(e.target.value)}
            onBlur={props.onBlur}
            autoFocus={props.autoFocus}
            name={props.name}
        />
    </div>
}
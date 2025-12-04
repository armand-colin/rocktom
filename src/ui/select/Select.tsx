import { useState, type MouseEvent } from "react";
import { Icon } from "../icon/Icon";
import "./Select.scss";

type Props<T> = {
    options: { label: string, value: T }[],
    value: T,
    onChange: (value: T) => void,
    placeholder?: string
}

export function Select<T extends string | number = string>(props: Props<T>) {
    const [open, setOpen] = useState(false)

    const current = props.options.find(option => option.value === props.value);

    function onClick(e: MouseEvent) {
        e.stopPropagation()
        setOpen(open => !open)
    }

    return <div
        className="Select"
        data-open={open}
    >
        <div className="current" onClick={onClick}>
            <span>
                {current ? current.label : props.placeholder ?? ""}
            </span>
            <div className="caret">
                <Icon name="arrow_drop_down" />
            </div>
        </div>
        <div className="options">
            {
                props.options.map(option => <div
                    key={option.value}
                    className="option"
                    data-selected={option.value === props.value}
                    onClick={(e) => {
                        e.stopPropagation()
                        setOpen(false)
                        props.onChange(option.value)
                    }}
                >
                    {option.label}
                </div>)
            }
        </div>
    </div>
}
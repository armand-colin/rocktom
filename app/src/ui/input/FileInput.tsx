import type { ChangeEvent } from "react"

type Props = {
    onChange: (file: File | null) => void,
    hidden?: boolean
    id?: string
    name?: string
}

export function FileInput(props: Props) {
    function onChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            props.onChange(file)
        } else {
            props.onChange(null)
        }
    }

    return <input 
        type="file"
        onChange={onChange}
        hidden={props.hidden}
        id={props.id}
        name={props.name}
    />
}
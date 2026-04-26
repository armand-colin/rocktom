import { useEffect, useState } from "react";
import { StringInput } from "../input/StringInput";
import "./EditableText.scss";

type Props = {
	value: string,
	onChange: (value: string) => void
}

export function EditableText(props: Props) {
	const [editing, setEditing] = useState(false)
	const [value, setValue] = useState(props.value)

	useEffect(() => {
		setValue(props.value)
	}, [props.value])

	return <div className="EditableText">
		{
			editing ?
				<StringInput
					name="editable-text"
					value={value}
					onChange={setValue}
					autoFocus
					onBlur={() => {
						props.onChange(value)
						setEditing(false)
					}}
				/> :
				<p onDoubleClick={() => setEditing(true)}>{props.value}</p>
		}
	</div>
}

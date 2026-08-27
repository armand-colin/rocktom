import { Rules } from "../../../../3d/Rules";
import type { Focus } from "../../../../sound/song/Focus";
import { NumberInput } from "../../../input/NumberInput";
import type { UiSize } from "../../../UiSize";
import "./FocusEditor.scss";

type Props = {
	value: Focus,
	onChange: (value: Focus) => void,
	size?: UiSize
}

export function FocusEditor(props: Props) {
	return <div className="FocusEditor">
		<NumberInput
			name="Low Fret"
			value={props.value.lowFret}
			step={1}
			min={0}
			max={props.value.highFret}
			sensibility={0.05}
			onChange={value => {
				props.onChange({
					lowFret: value,
					highFret: props.value.highFret
				})
			}}
			size={props.size}
		/>
		<NumberInput
			name="High Fret"
			value={props.value.highFret}
			step={1}
			min={props.value.lowFret}
			max={Rules.maxFret}
			sensibility={0.05}
			onChange={value => {
				props.onChange({
					lowFret: props.value.lowFret,
					highFret: value
				})
			}}
			size={props.size}
		/>
	</div>
}

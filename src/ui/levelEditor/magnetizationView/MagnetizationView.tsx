import { useComponent } from "@niloc/ecs-react";
import type { TimeTransform } from "../../../components/editor/TimeTransform";
import { Tempo } from "../../../sound/Tempo";
import { Select } from "../../select/Select";
import "./MagnetizationView.scss";

type Props = {
	transform: TimeTransform
}

const magnets = [
	{ value: 1, label: "None" },
	{ value: Tempo.beats(1 / 8), label: "Eighth Note" },
	{ value: Tempo.beats(1 / 4), label: "Quarter Note" },
	{ value: Tempo.beats(1 / 2), label: "Half Note" },
	{ value: Tempo.beats(1), label: "Beat" },
	{ value: Tempo.bars(1), label: "Bar" },
]

export function MagnetizationView(props: Props) {
	const { step } = useComponent(props.transform)

	return <div className="MagnetizationView">
		<Select
			value={step}
			options={magnets}
			onChange={step => props.transform.setStep(step)}
		/>
	</div>
}

import { useComponent } from "@niloc/ecs-react";
import type { TimeTransform } from "../../../components/editor/TimeTransform";
import { Tempo } from "../../../sound/Tempo";
import { Dropdown } from "../../dropdown/Dropdown";
import { UiSize } from "../../UiSize";
import "./MagnetizationView.scss";

type Props = {
	transform: TimeTransform,
	size?: UiSize
}

const magnets = [
	{ value: "none", label: "None", step: 1 },
	{ value: "eighth", label: "Eighth Note", step: Tempo.beats(1 / 8) },
	{ value: "quarter", label: "Quarter Note", step: Tempo.beats(1 / 4) },
	{ value: "half", label: "Half Note", step: Tempo.beats(1 / 2) },
	{ value: "beat", label: "Beat", step: Tempo.beats(1) },
	{ value: "bar", label: "Bar", step: Tempo.bars(1) },
]

export function MagnetizationView(props: Props) {
	const { step } = useComponent(props.transform)
	const selected = magnets.find(magnet => magnet.step === step)?.value ?? null

	return <div className="MagnetizationView">
		<Dropdown
			size={props.size}
			value={selected}
			options={magnets}
			onChange={magnet => {
				if (!magnet)
					return

				props.transform.setStep(magnet.step)
			}}
		/>
	</div>
}

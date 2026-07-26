import { useContext } from "react";
import "./MixerView.scss";
import { EngineContext } from "@niloc/ecs-react";
import { Mixer } from "../../resources/Mixer";
import { MixerChannelView } from "./MixerChannelView";

export function MixerView() {
	const { engine } = useContext(EngineContext)
	const mixer = engine.getResource(Mixer)

	return <div className="MixerView">
		<div className="channels">
			<MixerChannelView channel={mixer.master} />
			<MixerChannelView channel={mixer.audio} />
			<MixerChannelView channel={mixer.feedback} />
			<MixerChannelView channel={mixer.metronome} />
		</div>
	</div>
}
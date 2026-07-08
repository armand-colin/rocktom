import { useContext } from "react";
import "./MixerView.scss";
import { EngineContext, useComponent } from "@niloc/ecs-react";
import { Mixer, type MixerChannel } from "../../resources/Mixer";
import { Toggle } from "../toggle/Toggle";
import { Slider } from "../slider/Slider";

export function MixerView() {
	const { engine } = useContext(EngineContext)
	const mixer = engine.getResource(Mixer)

	return <div className="MixerView">
		<h2>Mixer</h2>
		<div className="channels">
			<ChannelView channel={mixer.master} />
			<ChannelView channel={mixer.audio} />
			<ChannelView channel={mixer.feedback} />
			<ChannelView channel={mixer.metronome} />
		</div>
	</div>
}

function ChannelView(props: { channel: MixerChannel }) {
	const { enabled, volume } = useComponent(props.channel)

	return <div className="ChannelView">
		<Toggle value={enabled} onChange={enabled => props.channel.setEnabled(enabled)} />

		<p>{props.channel.name}</p>

		<Slider
			value={volume}
			min={0}
			max={props.channel.maxVolume}
			onChange={v => props.channel.setVolume(v)}
		/>
	</div>
}

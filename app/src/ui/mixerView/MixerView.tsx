import { useContext } from "react";
import "./MixerView.scss";
import { EngineContext } from "@niloc/ecs-react";
import { Mixer, MixerChannel } from "../../resources/Mixer";
import { MixerChannelView } from "./MixerChannelView";
import { cn } from "../utils/cn";

export function MixerView(props: {
	className?: string,
}) {
	const { engine } = useContext(EngineContext)
	const mixer = engine.getResource(Mixer)

	return <div className={cn("MixerView", props.className)}>
		<div className="channels">
			<MixerChannelViewWithLabel channel={mixer.master} />
			<MixerChannelViewWithLabel channel={mixer.audio} />
			<MixerChannelViewWithLabel channel={mixer.feedback} />
			<MixerChannelViewWithLabel channel={mixer.metronome} />
			<MixerChannelViewWithLabel channel={mixer.virtualInstrument} />
		</div>
	</div>
}

function MixerChannelViewWithLabel(props: {
	channel: MixerChannel,
}) {
	return <div className="MixerChannelViewWithLabel">
		<p>{props.channel.name}</p>
		<MixerChannelView channel={props.channel} />
	</div>
}
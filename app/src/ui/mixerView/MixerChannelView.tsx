import { useComponent } from "@niloc/ecs-react"
import type { MixerChannel } from "../../resources/Mixer"
import { MixerButton } from "../mixerButton/MixerButton"
import { Slider } from "../slider/Slider"
import "./MixerChannelView.scss"

export function MixerChannelView(props: {
    channel: MixerChannel,
}) {
    const { volume } = useComponent(props.channel)

    return <div
        className="MixerChannelView"
    >
        <MixerButton channel={props.channel} />

        <span>
            {Math.round((volume / props.channel.maxVolume) * 100)}%
        </span>

        <Slider
            value={volume}
            min={0}
            max={props.channel.maxVolume}
            onChange={v => props.channel.setVolume(v)}
        />
    </div>
}

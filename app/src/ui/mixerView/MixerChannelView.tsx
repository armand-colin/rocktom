import { useComponent } from "@niloc/ecs-react"
import type { MixerChannel } from "../../resources/Mixer"
import { MixerButton } from "../mixerButton/MixerButton"
import { Slider } from "../slider/Slider"
import "./MixerChannelView.scss"

export function MixerChannelView(props: {
    channel: MixerChannel,
    hideLabel?: boolean
}) {
    const { volume } = useComponent(props.channel)
    const hideLabel = props.hideLabel ?? false

    return <div
        className="MixerChannelView"
        data-hide-label={hideLabel}
    >
        <MixerButton channel={props.channel} />

        {!hideLabel && <p>{props.channel.name}</p>}

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

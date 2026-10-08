import { useComponent } from "@niloc/ecs-react"
import type { MixerChannel } from "../../resources/Mixer"
import { MixerButton } from "../mixerButton/MixerButton"
import { Slider } from "../slider/Slider"
import "./MixerChannelView.scss"
import { cn } from "../utils/cn"

export function MixerChannelView(props: {
    channel: MixerChannel,
    className?: string,
}) {
    const { volume } = useComponent(props.channel)

    return <div
        className={cn("MixerChannelView", props.className)}
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

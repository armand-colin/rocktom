import type { MixerChannel } from "../resources/Mixer"
import { useComponent } from "../hooks/useComponent"
import { Button, ButtonTheme } from "./button/Button"
import { Icon } from "./icon/Icon"
import { UiSize } from "./UiSize"
import "./PlaybackTabFloatingControls.scss"

type Props = {
    visible: boolean,
    playing: boolean,
    onPlayPause: () => void,
    onScrollToTop: () => void,
    metronome: MixerChannel,
}

export function PlaybackTabFloatingControls(props: Props) {
    const { enabled } = useComponent(props.metronome)

    return <div
        className="PlaybackTabFloatingControls"
        data-visible={props.visible}
        aria-hidden={!props.visible}
        inert={!props.visible}
    >
        <Button
            shape="square"
            size={UiSize.Small}
            title="Back to top"
            onClick={props.onScrollToTop}
        >
            <Icon name="arrow_upward" />
        </Button>
        <Button
            shape="square"
            size={UiSize.Small}
            theme={ButtonTheme.Primary}
            title={props.playing ? "Pause" : "Play"}
            onClick={props.onPlayPause}
        >
            <Icon name={props.playing ? "pause" : "play_arrow"} />
        </Button>
        <Button
            shape="square"
            size={UiSize.Small}
            theme={enabled ? ButtonTheme.Primary : ButtonTheme.Default}
            title="Metronome"
            onClick={() => props.metronome.setEnabled(!enabled)}
        >
            <Icon name="av_timer" />
        </Button>
    </div>
}

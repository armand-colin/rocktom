import { useComponent } from "@niloc/ecs-react";
import type { MixerChannel } from "../../resources/Mixer";
import { Button, ButtonTheme } from "../button/Button";
import { Icon } from "../icon/Icon";
import { UiSize } from "../UiSize";

export function MixerButton(props: {
    channel: MixerChannel
}) {
    const { enabled } = useComponent(props.channel)

    return <Button
        shape="square"
        onClick={() => {
            props.channel.setEnabled(!enabled)
        }}
        theme={enabled ? ButtonTheme.Primary : ButtonTheme.Default}
        size={UiSize.S}
    >
        <Icon name={enabled ? "volume_up" : "volume_off"} />
    </Button>
}
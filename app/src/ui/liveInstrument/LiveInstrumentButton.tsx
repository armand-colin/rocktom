import { useResource } from "@niloc/ecs-react";
import { State } from "../../resources/State";
import { Button } from "../button/Button";
import { PopupManager } from "../../resources/PopupManager";
import { LiveInstrumentPopup } from "./LiveInstrumentPopup";
import { LED } from "../led/LED";
import { Icon } from "../icon/Icon";

function clampString(value: string, maxLength: number) {
    if (value.length <= maxLength)
        return value
    return value.slice(0, maxLength) + "..."
}

export function LiveInstrumentButton() {
    const { instrument } = useResource(State)
    const popupManager = useResource(PopupManager)

    function onClick() {
        popupManager.add(close => <LiveInstrumentPopup
            close={close}
        />)
    }

    return <Button
        onClick={onClick}
        className="items-center LiveInstrumentButton"
    >
        {
            instrument ?
                <>
                    <InstrumentLED />
                    <Icon
                        name="power"
                    />
                </> :
                <Icon
                    name="power_off"
                />
        }
        {
            instrument ?
                clampString(instrument.name, 20) :
                "Instrument (offline)"
        }
    </Button>
}

function InstrumentLED() {
    // TODO: show when instrument is 'playing' (e.g. there's sound)
    return <LED
        theme={"primary"}
    />
}
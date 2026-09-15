import { useResource } from "@niloc/ecs-react";
import { State } from "../../resources/State";
import { Button } from "../button/Button";
import { PopupManager } from "../../resources/PopupManager";
import { LiveInstrumentPopup } from "./LiveInstrumentPopup";
import { LED } from "../led/LED";
import { Icon } from "../icon/Icon";
import { LiveInstrumentPreferences } from "../../resources/LiveInstrumentPreferences";

export function LiveInstrumentButton() {
    const { liveInstrument: instrument } = useResource(State)
    const popupManager = useResource(PopupManager)
    const preferences = useResource(LiveInstrumentPreferences)

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
        {preferences.instrument.name}
    </Button>
}

function InstrumentLED() {
    // TODO: show when instrument is 'playing' (e.g. there's sound)
    return <LED
        theme={"primary"}
    />
}
import { useResource } from "@niloc/ecs-react";
import { State } from "../../resources/State";
import { Button } from "../button/Button";
import { PopupManager } from "../../resources/PopupManager";
import { LiveInstrumentPopup } from "./LiveInstrumentPopup";
import { LED } from "../led/LED";

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
    >
        <LED theme={instrument ? "primary" : "default"} />
        Instrument
    </Button>
}
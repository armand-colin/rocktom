import { useResource } from "@niloc/ecs-react";
import { State } from "../../resources/State";
import { Button, ButtonTheme } from "../button/Button";
import { PopupManager } from "../../resources/PopupManager";
import { LiveInstrumentPopup } from "./LiveInstrumentPopup";

export function LiveInstrumentButton() {
    const { instrument } = useResource(State)
    const popupManager = useResource(PopupManager)

    function onClick() {
        popupManager.add(close => <LiveInstrumentPopup 
            close={close} 
        />)
    }
    
    return <Button
        theme={instrument ? ButtonTheme.Primary : ButtonTheme.Default}
        onClick={onClick}
    >
        Instrument
    </Button>
}
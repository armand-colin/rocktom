import { useResource } from "@niloc/ecs-react"
import { PopupManager } from "../../resources/PopupManager"
import { Button, ButtonTheme } from "../button/Button"
import { Icon } from "../icon/Icon"
import { MetronomeToolPopup } from "./metronomeTool/MetronomeToolPopup"
import "./ToolList.scss"

export function ToolList() {
    const popupManager = useResource(PopupManager)

    function openMetronome() {
        popupManager.add(close => <MetronomeToolPopup close={close} />)
    }

    return <div className="ToolList">
        <h1>Tools</h1>
        <ul>
            <li>
                <Button
                    theme={ButtonTheme.Primary}
                    onClick={openMetronome}
                >
                    <Icon name="av_timer" />
                    Metronome
                </Button>
            </li>
        </ul>
    </div>
}

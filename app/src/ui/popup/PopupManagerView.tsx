import { useResource } from "@niloc/ecs-react";
import type { ReactNode } from "react";
import { PopupManager } from "../../resources/PopupManager";
import "./PopupManagerView.scss";

export function PopupManagerView() {
    const { popups } = useResource(PopupManager)

    return <div className="PopupManagerView">
        {
            popups.map(popup => <Popup
                content={popup.content}
                state={popup.state}
                key={popup.id}
                close={popup.close}
            />)
        }
    </div>
}

function Popup(props: { state: "open" | "closing", content: ReactNode, close: () => void }) {
    return <div
        className="Popup"
        data-state={props.state}
        onClick={props.close}
    >
        <div
            className="body"
            onClick={(e) => e.stopPropagation()}
        >
            {props.content}
        </div>
    </div>
}
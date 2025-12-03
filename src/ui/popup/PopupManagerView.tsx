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
            />)
        }
    </div>
}

function Popup(props: { state: "open" | "closing", content: ReactNode }) {
    return <div
        className="Popup"
        data-state={props.state}
    >
        <div className="body">
            {props.content}
        </div>
    </div>
}
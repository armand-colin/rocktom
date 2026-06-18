import { useResource } from "@niloc/ecs-react";
import type { ReactNode } from "react";
import { ToastManager } from "../../resources/ToastManager";
import "./ToastManagerView.scss";

export function ToastManagerView() {
    const { toasts } = useResource(ToastManager)

    return <div className="ToastManagerView">
        {
            toasts.map(toast => <Toast
                content={toast.content}
                state={toast.state}
                key={toast.id}
            />)
        }
    </div>
}

function Toast(props: { state: "open" | "closing", content: ReactNode }) {
    return <div
        className="Toast"
        data-state={props.state}
    >
        {props.content}
    </div>
}

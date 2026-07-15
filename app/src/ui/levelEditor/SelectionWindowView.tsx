import { useComponent } from "@niloc/ecs-react";
import type { CSSProperties } from "react";
import "./SelectionWindowView.scss"
import type { SelectionWindow } from "../../components/editor/SelectionWindow";

export function SelectionWindowView(props: { selectionWindow: SelectionWindow }) {
    const { start, end } = useComponent(props.selectionWindow)

    return <div 
    className="SelectionWindowView"
    style={{
        '--start-x': start.x,
        '--start-y': start.y,
        '--end-x': end.x,
        '--end-y': end.y,
    } as CSSProperties} />
}
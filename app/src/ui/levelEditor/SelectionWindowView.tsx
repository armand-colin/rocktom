import { useComponent } from "@niloc/ecs-react";
import type { CSSProperties } from "react";
import "./SelectionWindowView.scss"
import type { SelectionWindow } from "../../components/editor/SelectionWindow";

export function SelectionWindowView(props: { selectionWindow: SelectionWindow }) {
    const { start, end, enabled } = useComponent(props.selectionWindow)
    const minX = Math.min(start.x, end.x)
    const maxX = Math.max(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxY = Math.max(start.y, end.y)

    return <div
        className="SelectionWindowView"
        data-enabled={!!enabled}
        style={{
            '--start-x': minX,
            '--start-y': minY,
            '--end-x': maxX,
            '--end-y': maxY,
        } as CSSProperties} 
    />
}
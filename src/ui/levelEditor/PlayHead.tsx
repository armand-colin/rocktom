import type { CSSProperties } from "react";
import "./PlayHead.scss"

export function PlayHead(props: { ticks: number }) {
    return <div className="PlayHead"
        style={{
            "--ticks": props.ticks
        } as CSSProperties}
    ></div>
}
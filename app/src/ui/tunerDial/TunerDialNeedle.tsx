import "./TunerDialNeedle.scss"
import { TunerDialUtils } from "./TunerDialUtils"

type Props = {
    angle: number
    disabled?: boolean
    className?: string
}

export function TunerDialNeedle(props: Props) {
    const { pivot, needleLength } = TunerDialUtils.GEOMETRY
    const tip = {
        x: pivot.x,
        y: pivot.y - needleLength,
    }

    return <g
        className={`TunerDialNeedle ${props.className ?? ""}`}
        data-disabled={!!props.disabled}
        transform={`rotate(${props.angle}, ${pivot.x}, ${pivot.y})`}
    >
        <line
            className="TunerDialNeedle__line"
            x1={pivot.x}
            y1={pivot.y}
            x2={tip.x}
            y2={tip.y}
        />
        <circle
            className="TunerDialNeedle__pivot"
            cx={pivot.x}
            cy={pivot.y}
            r={1.5}
        />
    </g>
}

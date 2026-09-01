import type { CSSProperties } from "react"
import "./TunerDial.scss"
import { TunerDialMarkers } from "./TunerDialMarkers"
import { TunerDialNeedle } from "./TunerDialNeedle"
import { TunerDialUtils } from "./TunerDialUtils"

type Props = {
    cents: number
    locked?: boolean
    status?: TunerDialUtils.Status
    referenceFrequency?: number
    centRange?: number
    frequencySpan?: number
    height?: number | string
    className?: string
}

const DEFAULT_HEIGHT = 120

export function TunerDial(props: Props) {
    const centRange = props.centRange ?? 50
    const status = props.status ?? "idle"
    const height = props.height ?? DEFAULT_HEIGHT
    const angle = TunerDialUtils.centsToAngle(props.cents, centRange)

    return <div
        className={`TunerDial ${props.className ?? ""}`}
        data-status={status}
        data-locked={props.locked === false ? "false" : "true"}
        style={{ height } as CSSProperties}
    >
        <svg
            className="TunerDial__svg"
            viewBox={`0 0 ${TunerDialUtils.VIEWBOX.width} ${TunerDialUtils.VIEWBOX.height}`}
            preserveAspectRatio="xMidYMax meet"
            role="img"
            aria-label="Tuner dial"
        >
            <TunerDialMarkers
                referenceFrequency={props.referenceFrequency}
                centRange={centRange}
                frequencySpan={props.frequencySpan}
            />
            <TunerDialNeedle
                angle={angle}
                locked={props.locked}
            />
        </svg>
    </div>
}

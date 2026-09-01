import "./TunerDialMarkers.scss"
import { TunerDialUtils } from "./TunerDialUtils"

type Props = {
    referenceFrequency?: number
    centRange?: number
    frequencySpan?: number
    className?: string
}

type TickSpec = {
    value: number
    label?: string
    highlight?: boolean
}

function ArcTicks(props: {
    arc: TunerDialUtils.ArcGeometry
    ticks: TickSpec[]
    range: number
    unit?: string
    labelOffset?: number
}) {
    const { arc, ticks, range, unit, labelOffset = 10 } = props

    return <>
        {
            ticks.map(tick => {
                const angle = TunerDialUtils.centToArcAngle(tick.value, range)
                const outer = TunerDialUtils.pointOnArc(arc.cx, arc.cy, arc.rx, arc.ry, angle)
                const inner = TunerDialUtils.pointOnArc(arc.cx, arc.cy, arc.rx - 4, arc.ry - 1.5, angle)
                const labelPosition = TunerDialUtils.pointOnArc(
                    arc.cx,
                    arc.cy,
                    arc.rx + labelOffset,
                    arc.ry + labelOffset * 0.35,
                    angle,
                )

                return <g key={`${tick.value}-${tick.label ?? ""}`} className="TunerDialMarkers__tick">
                    <line
                        className="TunerDialMarkers__tick-line"
                        x1={inner.x}
                        y1={inner.y}
                        x2={outer.x}
                        y2={outer.y}
                    />
                    {
                        tick.label !== undefined &&
                            <text
                                className={`TunerDialMarkers__label${tick.highlight ? " TunerDialMarkers__label--highlight" : ""}`}
                                x={labelPosition.x}
                                y={labelPosition.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                            >
                                {tick.label}
                            </text>
                    }
                </g>
            })
        }
        {
            unit &&
                <>
                    <text
                        className="TunerDialMarkers__unit"
                        x={TunerDialUtils.pointOnArc(arc.cx, arc.cy, arc.rx + 14, arc.ry + 4, -TunerDialUtils.ARC_SPAN_DEGREES).x}
                        y={TunerDialUtils.pointOnArc(arc.cx, arc.cy, arc.rx + 14, arc.ry + 4, -TunerDialUtils.ARC_SPAN_DEGREES).y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {unit}
                    </text>
                    <text
                        className="TunerDialMarkers__unit"
                        x={TunerDialUtils.pointOnArc(arc.cx, arc.cy, arc.rx + 14, arc.ry + 4, TunerDialUtils.ARC_SPAN_DEGREES).x}
                        y={TunerDialUtils.pointOnArc(arc.cx, arc.cy, arc.rx + 14, arc.ry + 4, TunerDialUtils.ARC_SPAN_DEGREES).y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {unit}
                    </text>
                </>
        }
    </>
}

function MinorTicks(props: {
    arc: TunerDialUtils.ArcGeometry
    values: number[]
    range: number
}) {
    return <>
        {
            props.values.map(value => {
                const angle = TunerDialUtils.centToArcAngle(value, props.range)
                const outer = TunerDialUtils.pointOnArc(props.arc.cx, props.arc.cy, props.arc.rx, props.arc.ry, angle)
                const inner = TunerDialUtils.pointOnArc(props.arc.cx, props.arc.cy, props.arc.rx - 2, props.arc.ry - 0.75, angle)

                return <line
                    key={value}
                    className="TunerDialMarkers__minor-tick"
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                />
            })
        }
    </>
}

export function TunerDialMarkers(props: Props) {
    const referenceFrequency = props.referenceFrequency ?? 440
    const centRange = props.centRange ?? 50
    const frequencySpan = props.frequencySpan ?? 10
    const { centArc, hzArc, pivot } = TunerDialUtils.GEOMETRY

    const centTicks: TickSpec[] = [
        { value: -centRange, label: `-${centRange}` },
        { value: 0, label: "0", highlight: true },
        { value: centRange, label: `+${centRange}` },
    ]

    const hzTicks: TickSpec[] = [
        { value: -frequencySpan, label: `${referenceFrequency - frequencySpan}` },
        { value: 0, label: `${referenceFrequency}`, highlight: true },
        { value: frequencySpan, label: `${referenceFrequency + frequencySpan}` },
    ]

    const centMinorTicks = [-37.5, -25, -12.5, 12.5, 25, 37.5].map(
        value => value * centRange / 50,
    )

    const hzMinorTicks = [-7.5, -5, -2.5, 2.5, 5, 7.5].map(
        value => value * frequencySpan / 10,
    )

    return <g className={`TunerDialMarkers ${props.className ?? ""}`}>
        <path
            className="TunerDialMarkers__arc"
            d={TunerDialUtils.describeArc(hzArc.cx, hzArc.cy, hzArc.rx, hzArc.ry, -TunerDialUtils.ARC_SPAN_DEGREES, TunerDialUtils.ARC_SPAN_DEGREES)}
        />
        <path
            className="TunerDialMarkers__arc"
            d={TunerDialUtils.describeArc(centArc.cx, centArc.cy, centArc.rx, centArc.ry, -TunerDialUtils.ARC_SPAN_DEGREES, TunerDialUtils.ARC_SPAN_DEGREES)}
        />

        <MinorTicks arc={hzArc} values={hzMinorTicks} range={frequencySpan} />
        <ArcTicks arc={hzArc} ticks={hzTicks} range={frequencySpan} unit="Hz" labelOffset={11} />

        <MinorTicks arc={centArc} values={centMinorTicks} range={centRange} />
        <ArcTicks arc={centArc} ticks={centTicks} range={centRange} unit="CENT" labelOffset={12} />

        <path
            className="TunerDialMarkers__pivot-arc"
            d={TunerDialUtils.describeArc(pivot.x, pivot.y + 2, 14, 4, -28, 28)}
        />

        <text
            className="TunerDialMarkers__symbol"
            x={pivot.x - 24}
            y={pivot.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
        >
            ♭
        </text>
        <text
            className="TunerDialMarkers__symbol"
            x={pivot.x + 24}
            y={pivot.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
        >
            ♯
        </text>
    </g>
}

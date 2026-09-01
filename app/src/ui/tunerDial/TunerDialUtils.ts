export namespace TunerDialUtils {

    export type Status = "idle" | "success" | "warn" | "error"

    export type ArcGeometry = {
        cx: number
        cy: number
        rx: number
        ry: number
    }

    export const VIEWBOX = {
        width: 200,
        height: 110,
    } as const

    export const GEOMETRY = {
        pivot: { x: 100, y: 102 },
        needleLength: 72,
        centArc: { cx: 100, cy: 62, rx: 82, ry: 34 },
        hzArc: { cx: 100, cy: 30, rx: 88, ry: 22 },
    } as const satisfies {
        pivot: { x: number, y: number }
        needleLength: number
        centArc: ArcGeometry
        hzArc: ArcGeometry
    }

    export const MAX_NEEDLE_ANGLE = 45
    export const ARC_SPAN_DEGREES = 56

    export function centsToAngle(cents: number, range: number): number {
        const clamped = Math.max(-range, Math.min(range, cents))
        return (clamped / range) * MAX_NEEDLE_ANGLE
    }

    export function centToArcAngle(cents: number, range: number): number {
        const clamped = Math.max(-range, Math.min(range, cents))
        return (clamped / range) * ARC_SPAN_DEGREES
    }

    export function pointOnArc(
        cx: number,
        cy: number,
        rx: number,
        ry: number,
        angleDegrees: number,
    ) {
        const radians = angleDegrees * Math.PI / 180
        return {
            x: cx + rx * Math.sin(radians),
            y: cy - ry * Math.cos(radians),
        }
    }

    export function describeArc(
        cx: number,
        cy: number,
        rx: number,
        ry: number,
        startAngle: number,
        endAngle: number,
    ) {
        const start = pointOnArc(cx, cy, rx, ry, startAngle)
        const end = pointOnArc(cx, cy, rx, ry, endAngle)
        const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0
        const sweep = endAngle > startAngle ? 1 : 0

        return `M ${start.x} ${start.y} A ${rx} ${ry} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`
    }

}

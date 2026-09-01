import { useMemo, useState } from "react"
import { Slider } from "../slider/Slider"
import { TunerDial } from "./TunerDial"
import { TunerDialUtils } from "./TunerDialUtils"

export default {
    title: "TunerDial",
    component: TunerDial,
    argTypes: {
        locked: { control: "boolean" },
        status: {
            control: "select",
            options: ["idle", "success", "warn", "error"] satisfies TunerDialUtils.Status[],
        },
        height: { control: "number" },
        referenceFrequency: { control: "number" },
        centRange: { control: "number" },
    },
}

export const Default = (args: {
    locked?: boolean
    status?: TunerDialUtils.Status
    height?: number
    referenceFrequency?: number
    centRange?: number
}) => {
    const [cents, setCents] = useState(0)
    const centRange = args.centRange ?? 50

    return <div className="flex flex-col gap-4 w-[360px]">
        <TunerDial
            cents={cents}
            locked={args.locked ?? true}
            status={args.status ?? "success"}
            height={args.height ?? 140}
            referenceFrequency={args.referenceFrequency ?? 440}
            centRange={centRange}
        />
        <div className="flex flex-col gap-2">
            <p className="text-sm text-white/70">{cents.toFixed(1)} cents</p>
            <Slider
                value={cents}
                onChange={setCents}
                min={-centRange}
                max={centRange}
                step={0.5}
            />
        </div>
    </div>
}

export const Locked = () => {
    return <div className="w-[360px]">
        <TunerDial cents={12} locked={false} status="idle" height={140} />
    </div>
}

export const Statuses = () => {
    const statuses = ["idle", "success", "warn", "error"] as const

    return <div className="flex flex-col gap-4 w-[360px]">
        {
            statuses.map(status => {
                const cents = status === "success" ? 1 :
                    status === "warn" ? 8 :
                        status === "error" ? 22 :
                            0

                return <div key={status} className="flex flex-col gap-1">
                    <p className="text-sm text-white/70">{status}</p>
                    <TunerDial
                        cents={cents}
                        locked
                        status={status}
                        height={120}
                    />
                </div>
            })
        }
    </div>
}

export const Heights = () => {
    const heights = [80, 120, 180]

    return <div className="flex flex-col gap-4 w-[360px]">
        {
            heights.map(height => {
                return <div key={height} className="flex flex-col gap-1">
                    <p className="text-sm text-white/70">{height}px</p>
                    <TunerDial cents={-18} locked status="success" height={height} />
                </div>
            })
        }
    </div>
}

export const CustomReference = () => {
    return <div className="w-[360px]">
        <TunerDial
            cents={-6}
            locked
            status="success"
            height={140}
            referenceFrequency={432}
        />
    </div>
}

export const LiveSimulation = () => {
    const [cents, setCents] = useState(0)

    const status = useMemo(() => {
        const abs = Math.abs(cents)
        if (abs < 5)
            return "success"
        if (abs < 10)
            return "warn"
        return "error"
    }, [cents])

    return <div className="flex flex-col gap-4 w-[360px]">
        <TunerDial
            cents={cents}
            locked
            status={status}
            height={160}
        />
        <div className="flex gap-2">
            <button
                className="px-3 py-1 rounded bg-white/10 text-white text-sm"
                onClick={() => setCents(value => Math.max(-50, value - 2))}
            >
                -2¢
            </button>
            <button
                className="px-3 py-1 rounded bg-white/10 text-white text-sm"
                onClick={() => setCents(0)}
            >
                Reset
            </button>
            <button
                className="px-3 py-1 rounded bg-white/10 text-white text-sm"
                onClick={() => setCents(value => Math.min(50, value + 2))}
            >
                +2¢
            </button>
        </div>
    </div>
}

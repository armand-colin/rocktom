import { useState } from "react"
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
            disabled={args.locked ?? true}
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

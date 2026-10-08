import { Enum } from "../utils/Enum"

export const PlaybackVisualMode = Enum.create({
    ThreeD: "3d",
    Tab: "tab",
}, {
    fromSearchParam(value: string | null): PlaybackVisualMode {
        return PlaybackVisualMode.parseSafe(value) ?? PlaybackVisualMode.ThreeD
    },
})

export type PlaybackVisualMode = Enum.Infer<typeof PlaybackVisualMode>

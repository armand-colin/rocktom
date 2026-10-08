import { Enum } from "../utils/Enum"

export const PlaybackVisualMode = Enum.create({
    ThreeD: "3d",
    Tab: "tab",
})

export type PlaybackVisualMode = Enum.Infer<typeof PlaybackVisualMode>

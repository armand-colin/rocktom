import { Enum } from "../utils/Enum"

export const UiSize = Enum.create({
    M: "md",
    S: "sm",
    XS: "xs",
} as const)

export type UiSize = Enum.Infer<typeof UiSize>
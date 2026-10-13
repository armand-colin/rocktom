import { Enum } from "../utils/Enum"

export const UiSize = Enum.create({
    Large: "lg",
    Medium: "md",
    Small: "sm",
    XSmall: "xs",
})

export type UiSize = Enum.Infer<typeof UiSize>
import { Enum } from "../utils/Enum"

export const UiSize = Enum.create({
    L: "lg",
    M: "md",
    S: "sm",
    XS: "xs",
})

export type UiSize = Enum.Infer<typeof UiSize>
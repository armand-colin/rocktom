export const UiSize  = {
    M: "md" as const,
    S: "sm" as const,
    XS: "xs" as const,

    all: ["md", "sm", "xs"] as UiSize[],
}

export type UiSize = "md" | "sm" | "xs"
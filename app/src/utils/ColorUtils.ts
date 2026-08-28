import type { Color } from "three"

export namespace ColorUtils {

    export function darken(color: Color, amount: number): Color {
        return color.clone().offsetHSL(0, 0, -amount)
    }

    export function lighten(color: Color, amount: number): Color {
        return color.clone().offsetHSL(0, 0, amount)
    }

}

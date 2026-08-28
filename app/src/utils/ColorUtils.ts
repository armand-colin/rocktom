import { Color } from "three"

export namespace ColorUtils {

    export function darken(color: Color, amount: number): Color {
        return color.clone().offsetHSL(0, 0, -amount)
    }

    export function lighten(color: Color, amount: number): Color {
        return color.clone().offsetHSL(0, 0, amount)
    }

    export function clone(color: Color): Color {
        return color.clone()
    }

    export function toHex(color: Color): string {
        return "#" + color.getHexString()
    }

    export function fromHex(hex: string): Color | null {
        const normalized = hex.trim().replace(/^#/, "")
        if (!/^[0-9a-fA-F]{6}$/.test(normalized))
            return null

        return new Color("#" + normalized)
    }

    export function getRgb(color: Color): { r: number, g: number, b: number } {
        return {
            r: Math.round(color.r * 255),
            g: Math.round(color.g * 255),
            b: Math.round(color.b * 255),
        }
    }

    export function getHsl(color: Color): { h: number, s: number, l: number } {
        const hsl = { h: 0, s: 0, l: 0 }
        color.getHSL(hsl)
        return {
            h: Math.round(hsl.h * 360),
            s: Math.round(hsl.s * 100),
            l: Math.round(hsl.l * 100),
        }
    }

    export function setFromRgb(color: Color, r: number, g: number, b: number): Color {
        return color.clone().setRGB(
            clamp(r, 0, 255) / 255,
            clamp(g, 0, 255) / 255,
            clamp(b, 0, 255) / 255,
        )
    }

    export function setFromHsl(color: Color, h: number, s: number, l: number): Color {
        return color.clone().setHSL(
            clamp(h, 0, 360) / 360,
            clamp(s, 0, 100) / 100,
            clamp(l, 0, 100) / 100,
        )
    }

}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

import { Color } from "three"

const colors = [
    new Color("#ff1919"), // 0 E
    new Color("#fcc513"), // 1 A
    new Color("#2d2dff"), // 2 D
    new Color("#ff6a13"), // 3 G
    new Color("#19c850"), // 4 B (guitar)
    new Color("#c13cff"), // 5 e (guitar)
    new Color("#888888"), // 6 Neutral
    new Color("#ffffff"), // 7 Reserve
]

export namespace AtlasPalette {

    export const count = 8
    export const Neutral = 6
    export const Reserve = 7

    export const labels = ["E", "A", "D", "G", "B", "e", "Neutral", "Reserve"]

    export function color(index: number): Color {
        return colors[index]
    }

    export function css(index: number): string {
        return "#" + colors[index].getHexString()
    }

}

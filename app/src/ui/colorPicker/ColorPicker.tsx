import { useRef, useState, type CSSProperties, type MouseEvent } from "react"
import type { Color } from "three"
import { ColorUtils } from "../../utils/ColorUtils"
import { Button, ButtonTheme } from "../button/Button"
import { NumberInput } from "../input/NumberInput"
import { Slider } from "../slider/Slider"
import { UiSize } from "../UiSize"
import "./ColorPicker.scss"

type ColorMode = "rgb" | "hsl"

type Props = {
    value: Color
    onChange: (color: Color) => void
}

export function ColorPicker(props: Props) {
    const [mode, setMode] = useState<ColorMode>("hsl")
    const hsl = ColorUtils.getHsl(props.value)
    const rgb = ColorUtils.getRgb(props.value)
    const areaRef = useRef<HTMLDivElement | null>(null)

    function emit(color: Color) {
        props.onChange(ColorUtils.clone(color))
    }

    function onHueChange(h: number) {
        emit(ColorUtils.setFromHsl(props.value, h, hsl.s, hsl.l))
    }

    function onSaturationLightnessChange(s: number, l: number) {
        emit(ColorUtils.setFromHsl(props.value, hsl.h, s, l))
    }

    function onRgbChange(r: number, g: number, b: number) {
        emit(ColorUtils.setFromRgb(props.value, r, g, b))
    }

    function onAreaMouseDown(event: MouseEvent) {
        event.stopPropagation()
        updateFromArea(event)

        function onMouseMove(e: globalThis.MouseEvent) {
            updateFromArea(e)
        }

        function onMouseUp() {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }

        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
    }

    function updateFromArea(event: { clientX: number, clientY: number }) {
        const area = areaRef.current
        if (!area)
            return

        const rect = area.getBoundingClientRect()
        const tX = clamp((event.clientX - rect.left) / rect.width, 0, 1)
        const tY = clamp((event.clientY - rect.top) / rect.height, 0, 1)
        const s = Math.round(tX * 100)
        const l = Math.round((1 - tY) * 100)
        onSaturationLightnessChange(s, l)
    }

    function onMouseDown(event: MouseEvent) {
        event.stopPropagation()
    }

    return <div
        className="ColorPicker"
        onMouseDown={onMouseDown}
    >
        <div className="preview">
            <div
                className="swatch"
                style={{ background: ColorUtils.toHex(props.value) }}
            />
            <span className="hex">{ColorUtils.toHex(props.value)}</span>
        </div>

        <div
            className="area"
            ref={areaRef}
            style={{
                "--hue": hsl.h,
                "--x": hsl.s / 100,
                "--y": 1 - hsl.l / 100,
            } as CSSProperties}
            onMouseDown={onAreaMouseDown}
        >
            <div className="cursor" />
        </div>

        <div className="hue">
            <Slider
                min={0}
                max={360}
                step={1}
                value={hsl.h}
                onChange={onHueChange}
            />
        </div>

        <div className="mode">
            <Button
                size={UiSize.S}
                theme={mode === "rgb" ? ButtonTheme.Primary : ButtonTheme.Default}
                onClick={() => setMode("rgb")}
            >
                RGB
            </Button>
            <Button
                size={UiSize.S}
                theme={mode === "hsl" ? ButtonTheme.Primary : ButtonTheme.Default}
                onClick={() => setMode("hsl")}
            >
                HSL
            </Button>
        </div>

        {
            mode === "rgb" ?
                <div className="channels">
                    <label>
                        R
                        <NumberInput
                            name="color-r"
                            size={UiSize.S}
                            min={0}
                            max={255}
                            step={1}
                            value={rgb.r}
                            onChange={r => onRgbChange(r, rgb.g, rgb.b)}
                        />
                    </label>
                    <label>
                        G
                        <NumberInput
                            name="color-g"
                            size={UiSize.S}
                            min={0}
                            max={255}
                            step={1}
                            value={rgb.g}
                            onChange={g => onRgbChange(rgb.r, g, rgb.b)}
                        />
                    </label>
                    <label>
                        B
                        <NumberInput
                            name="color-b"
                            size={UiSize.S}
                            min={0}
                            max={255}
                            step={1}
                            value={rgb.b}
                            onChange={b => onRgbChange(rgb.r, rgb.g, b)}
                        />
                    </label>
                </div> :
                <div className="channels">
                    <label>
                        H
                        <NumberInput
                            name="color-h"
                            size={UiSize.S}
                            min={0}
                            max={360}
                            step={1}
                            value={hsl.h}
                            onChange={h => onHueChange(h)}
                        />
                    </label>
                    <label>
                        S
                        <NumberInput
                            name="color-s"
                            size={UiSize.S}
                            min={0}
                            max={100}
                            step={1}
                            value={hsl.s}
                            onChange={s => onSaturationLightnessChange(s, hsl.l)}
                        />
                    </label>
                    <label>
                        L
                        <NumberInput
                            name="color-l"
                            size={UiSize.S}
                            min={0}
                            max={100}
                            step={1}
                            value={hsl.l}
                            onChange={l => onSaturationLightnessChange(hsl.s, l)}
                        />
                    </label>
                </div>
        }
    </div>
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

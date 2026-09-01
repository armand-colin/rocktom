import { useEffect, useState, type MouseEvent } from "react"
import { useResource } from "@niloc/ecs-react"
import type { Color } from "three"
import { ContextualMenu } from "../../resources/contextualMenu/ContextualMenu"
import { ContextualMenuItem } from "../../resources/contextualMenu/ContextualMenuItem"
import { ColorUtils } from "../../utils/ColorUtils"
import { ColorPicker } from "../colorPicker/ColorPicker"
import { StringInput } from "./StringInput"
import { UiSize } from "../UiSize"
import "./ColorInput.scss"
import { Button } from "../button/Button"

type Props = {
    value: Color
    onChange: (color: Color) => void
    size?: UiSize
    disabled?: boolean
}

export function ColorInput(props: Props) {
    const contextualMenu = useResource(ContextualMenu)
    const [text, setText] = useState(ColorUtils.toHex(props.value))

    useEffect(() => {
        setText(ColorUtils.toHex(props.value))
    }, [props.value])

    function onSwatchClick(e: MouseEvent) {
        if (props.disabled)
            return

        contextualMenu.open(e.nativeEvent, [
            ContextualMenuItem.custom((close) => <div>
                <div><Button onClick={close}>Close</Button></div>
                <ColorPicker
                    value={props.value}
                    onChange={props.onChange}
                />
            </div>),
        ])
    }

    function onTextChange(value: string) {
        setText(value)
        const color = ColorUtils.fromHex(value)
        if (color)
            props.onChange(color)
    }

    function onBlur() {
        setText(ColorUtils.toHex(props.value))
    }

    return <div
        className="ColorInput"
        data-size={props.size ?? UiSize.M}
        data-disabled={props.disabled ?? false}
    >
        <button
            type="button"
            className="swatch"
            style={{ background: ColorUtils.toHex(props.value) }}
            onClick={onSwatchClick}
            disabled={props.disabled}
            aria-label="Open color picker"
        />
        <StringInput
            name="color"
            size={props.size}
            value={text}
            onChange={onTextChange}
            onBlur={onBlur}
        />
    </div>
}

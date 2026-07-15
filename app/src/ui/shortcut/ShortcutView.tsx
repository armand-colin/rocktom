import { Fragment, useMemo } from "react";
import { KeyCode, Shortcut } from "../../resources/shortcut/Shortcut";
import './ShortcutView.scss'
import { Icon } from "../icon/Icon";
import { OS } from "../../utils/OS";

export function ShortcutView(props: { shortcut: Shortcut }) {
    const parts = useMemo(() => {
        const parts = []

        if (props.shortcut.ctrl) {
            if (OS.isMacOS)
                parts.push(<Icon name="keyboard_command_key" />)
            else
                parts.push(<>Ctrl</>)
        }

        if (props.shortcut.alt) {
            if (OS.isMacOS)
                parts.push(<Icon name="keyboard_option_key" />)
            else
                parts.push(<>Alt</>)
        }

        if (props.shortcut.shift)
            parts.push(<>Shift</>)

        if (props.shortcut.keyCode === KeyCode.Space)
            parts.push(<Icon name="space_bar" />)
        else
            parts.push(<>{KeyCode.toString(props.shortcut.keyCode)}</>)

        return parts
    }, [props.shortcut])

    return <div className="ShortcutView">
        {parts.map((part, index) => {
            return <Fragment key={index}>
                {
                    index > 0 && <span>+</span>
                }
                <span>
                    {part}
                </span>
            </Fragment>
        })}
    </div>
}
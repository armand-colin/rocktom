import { Shortcut, KeyCode } from "../../resources/shortcut/Shortcut";
import { ShortcutView } from "./ShortcutView";

export default {
    title: 'UI/Shortcut',
    component: ShortcutView,
}

const shortcuts = [
    new Shortcut({ keyCode: KeyCode.Space }),
    new Shortcut({ keyCode: KeyCode.R, ctrl: true }),
    new Shortcut({ keyCode: KeyCode.S, alt: true }),
]

export const Default = () => {
    return <div className="flex p-l gap-m">
        {shortcuts.map((shortcut) => (
            <ShortcutView key={shortcut.keyCode} shortcut={shortcut} />
        ))}
    </div>
}
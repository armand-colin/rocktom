import { KeyCode, Shortcut } from "../../resources/shortcut/Shortcut";
import { Toolbar } from "./Toolbar";

export default {
    title: "Toolbar",
    component: Toolbar,
}

const tabs: Toolbar.Tab[] = [
    Toolbar.Tab.create("File", [
        Toolbar.Item.shortcut("New", new Shortcut({ keyCode: KeyCode.N, ctrl: true })),
        Toolbar.Item.simple("Open", () => {}),
        Toolbar.Item.simple("Save", () => {}),
        Toolbar.Item.simple("Save As", () => {}),
        Toolbar.Item.simple("Save All", () => {}),
        Toolbar.Item.simple("Close", () => {}),
        Toolbar.Item.simple("Exit", () => {}),
    ]),
    Toolbar.Tab.create("Edit", [
        Toolbar.Item.simple("Undo", () => {}),
        Toolbar.Item.simple("Redo", () => {}),
        Toolbar.Item.simple("Cut", () => {}),
        Toolbar.Item.menu("Meditation", [
            Toolbar.Item.simple("Meditation 1", () => {}),
            Toolbar.Item.simple("Meditation 2", () => {}),
            Toolbar.Item.simple("Meditation 3", () => {}),
        ]),
        Toolbar.Item.simple("Paste", () => {}),
        Toolbar.Item.simple("Delete", () => {}),
    ]),
]

export const Default = () => {
    return <div className="p-4">
        <Toolbar tabs={tabs} />
    </div>
}
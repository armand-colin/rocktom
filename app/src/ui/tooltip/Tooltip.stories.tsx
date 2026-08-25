import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "../button/Button"
import { ShortcutView } from "../shortcut/ShortcutView"
import { UiSize } from "../UiSize"
import { KeyCode, Shortcut } from "../../resources/shortcut/Shortcut"
import { Tooltip } from "./Tooltip"

const meta = {
    title: "UI/Tooltip",
    component: Tooltip,
    args: {
        content: "Save",
        size: UiSize.M,
        placement: "top",
        disabled: false,
        children: <Button>Hover me</Button>,
    },
    argTypes: {
        size: {
            control: "radio",
            options: [UiSize.S, UiSize.M],
        },
        placement: {
            control: "radio",
            options: ["top", "bottom", "left", "right"],
        },
    },
    decorators: [
        (Story) => (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200, padding: 48 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
    args: {
        content: "Save document",
    },
}

export const WithShortcut: Story = {
    args: {
        content: (
            <>
                Save
                <ShortcutView shortcut={new Shortcut({ keyCode: KeyCode.S, ctrl: true })} />
            </>
        ),
        size: UiSize.S,
    },
}

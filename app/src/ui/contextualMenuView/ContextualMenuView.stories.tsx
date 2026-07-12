import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Instance } from "../../Instance";
import { ContextualMenu } from "../../resources/contextualMenu/ContextualMenu";
import { Button } from "../button/Button";
import { ContextualMenuView } from "./ContextualMenuView";
import { ContextualMenuItem } from "../../resources/contextualMenu/ContextualMenuItem";

const noop = () => {};

const singleItemWithIcon: ContextualMenuItem[] = [
  ContextualMenuItem.action({
    label: "Edit",
    icon: "edit",
    action: noop,
  })
];

const multipleItemsWithIcons: ContextualMenuItem[] = [
  ContextualMenuItem.action({
    label: "Play",
    icon: "play_arrow",
    action: noop,
  }),
  ContextualMenuItem.action({
    label: "Edit",
    icon: "edit",
    action: noop,
  }),
  ContextualMenuItem.separator(),
  ContextualMenuItem.action({
    label: "Duplicate",
    icon: "code",
    action: noop,
  }),
  ContextualMenuItem.action({
    label: "Delete",
    icon: "close",
    action: noop,
  }),
];

const textOnlyItems: ContextualMenuItem[] = [
  ContextualMenuItem.action({
    label: "Edit Pattern",
    action: noop,
  }),
  ContextualMenuItem.action({
    label: "Delete Pattern",
    action: noop,
  }),
];

const mixedItems: ContextualMenuItem[] = [
  ContextualMenuItem.action({
    label: "Edit Pattern",
    action: noop,
  }),
  ContextualMenuItem.action({
    label: "Delete Pattern",
    icon: "shift",
    action: noop,
  }),
];

const longLabelItems: ContextualMenuItem[] = [
  ContextualMenuItem.action({
    label: "Export level as MIDI file",
    icon: "code",
    action: noop,
  }),
  ContextualMenuItem.action({
    label: "Copy shareable link to clipboard",
    icon: "home",
    action: noop,
  }),
];

function openMenuAt(x: number, y: number, items: ContextualMenuItem[]) {
  const contextualMenu = Instance.engine.getResource(ContextualMenu);
  contextualMenu.open(
    {
      clientX: x,
      clientY: y,
      preventDefault: () => {},
      stopPropagation: () => {},
    } as MouseEvent,
    items,
  );
}

type DemoProps = {
  items: ContextualMenuItem[];
  position?: { x: number; y: number };
  autoOpen?: boolean;
};

function ContextualMenuDemo({
  items,
  position = { x: 120, y: 80 },
  autoOpen = true,
}: DemoProps) {
  useEffect(() => {
    if (autoOpen) {
      openMenuAt(position.x, position.y, items);
    }

    return () => {
      Instance.engine.getResource(ContextualMenu).close();
    };
  }, [autoOpen, items, position.x, position.y]);

  return (
    <>
      <ContextualMenuView />
      <div style={{ padding: 24 }}>
        <p style={{ margin: "0 0 12px" }}>
          Right-click the area below or use the button to open the menu.
        </p>
        <div
          style={{
            width: 320,
            height: 180,
            border: "1px dashed #666",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}
          onContextMenu={(e) => {
            Instance.engine.getResource(ContextualMenu).open(e.nativeEvent, items);
          }}
        >
          Right-click here
        </div>
        <div style={{ marginTop: 12 }}>
          <Button onClick={() => openMenuAt(position.x, position.y, items)}>
            Open menu
          </Button>
        </div>
      </div>
    </>
  );
}

const meta = {
  title: "UI/ContextualMenu",
  component: ContextualMenuDemo,
} satisfies Meta<typeof ContextualMenuDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleItemWithIcon: Story = {
  args: {
    items: singleItemWithIcon,
  },
};

export const MultipleItemsWithIcons: Story = {
  args: {
    items: multipleItemsWithIcons,
    position: { x: 120, y: 60 },
  },
};

export const TextOnly: Story = {
  args: {
    items: textOnlyItems,
    position: { x: 120, y: 100 },
  },
};

export const Mixed: Story = {
  args: {
    items: mixedItems,
    position: { x: 120, y: 100 },
  },
};

export const LongLabels: Story = {
  args: {
    items: longLabelItems,
    position: { x: 80, y: 80 },
  },
};

export const Interactive: Story = {
  args: {
    items: multipleItemsWithIcons,
    autoOpen: false,
  },
};

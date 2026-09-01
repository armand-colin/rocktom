import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Color } from "three";
import { ColorPicker } from "./ColorPicker";
import { ColorUtils } from "../../utils/ColorUtils";

const meta = {
  title: "UI/ColorPicker",
  component: ColorPicker,
  args: {
    value: new Color("#ff1919"),
    onChange: () => {},
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  render: () => {
    const [color, setColor] = useState(() => new Color("#ff1919"));

    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 280 }}>
        <ColorPicker value={color} onChange={setColor} />
        <div
          style={{
            height: 48,
            borderRadius: 8,
            background: ColorUtils.toHex(color),
            border: "1px solid #666",
          }}
        />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {ColorUtils.toHex(color)}
        </span>
      </div>
    );
  },
};

export const WithCloseButton: Story = {
  render: () => {
    const [color, setColor] = useState(() => new Color("#2d2dff"));

    return (
      <ColorPicker
        value={color}
        onChange={setColor}
      />
    );
  },
};

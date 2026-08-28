import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Color } from "three";
import { Instance } from "../../Instance";
import { ContextualMenu } from "../../resources/contextualMenu/ContextualMenu";
import { ColorUtils } from "../../utils/ColorUtils";
import { ContextualMenuView } from "../contextualMenuView/ContextualMenuView";
import { UiSize } from "../UiSize";
import { ColorInput } from "./ColorInput";

const meta = {
  title: "UI/Input/ColorInput",
  component: ColorInput,
  args: {
    value: new Color("#ff1919"),
    onChange: () => {},
    size: UiSize.M,
  },
  argTypes: {
    size: {
      control: "radio",
      options: UiSize.all,
    },
  },
} satisfies Meta<typeof ColorInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  render: (args) => {
    const [color, setColor] = useState(() => new Color("#ff1919"));

    useEffect(() => {
      return () => {
        Instance.engine.getResource(ContextualMenu).close();
      };
    }, []);

    return (
      <>
        <ContextualMenuView />
        <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
          {
            UiSize.all.map(size => (
              <ColorInput
                key={size}
                {...args}
                size={size}
                value={color}
                onChange={setColor}
              />
            ))
          }
          <div
            style={{
              height: 48,
              borderRadius: 8,
              background: ColorUtils.toHex(color),
              border: "1px solid #666",
            }}
          />
        </div>
      </>
    );
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [color, setColor] = useState(() => new Color("#19c850"));

    useEffect(() => {
      return () => {
        Instance.engine.getResource(ContextualMenu).close();
      };
    }, []);

    return (
      <>
        <ContextualMenuView />
        <ColorInput
          {...args}
          value={color}
          onChange={setColor}
          disabled
        />
      </>
    );
  },
};

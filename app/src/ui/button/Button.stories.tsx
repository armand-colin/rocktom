import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";
import { UiSize } from "../UiSize";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Click me",
    disabled: false,
    size: UiSize.M,
  },
  argTypes: {
    size: {
      control: "radio",
      options: [UiSize.S, UiSize.M],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Button {...args} disabled={false}>
        Enabled
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
    </div>
  ),
};

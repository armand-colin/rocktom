import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ButtonTheme } from "./Button";
import { UiSize } from "../UiSize";
import { Icon } from "../icon/Icon";
import { Fragment } from "react/jsx-runtime";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Click me",
    disabled: false,
    theme: ButtonTheme.Default,
  },
  argTypes: {
    size: {
      control: "radio",
      options: [UiSize.S, UiSize.M],
    },
    theme: {
      control: "radio",
      options: [ButtonTheme.Default, ButtonTheme.Primary, ButtonTheme.Danger, ButtonTheme.Ghost],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {
        UiSize.all.map(size => (<div
          key={size}
          className="grid gap-4 grid-cols-[80px_100px_100px] items-start justify-items-start"
        >
          <Button
            {...args}
            size={size}
            disabled={false}
          >
            Button
          </Button>

          <Button
            {...args}
            size={size}
            disabled={false}
          >
            <Icon name="delete" />
            Button
          </Button>

          <Button
            {...args}
            size={size}
            disabled={false}
            shape="square"
          >
            <Icon name="delete" />
          </Button>
        </div>
        ))
      }
    </div>
  ),
};

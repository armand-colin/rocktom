import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StringInput } from "./StringInput";

const meta = {
  title: "UI/Input/StringInput",
  component: StringInput,
  args: {
    name: "title",
    value: "My value",
    placeholder: "Type here",
    type: "text",
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["text", "email"],
    },
  },
} satisfies Meta<typeof StringInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value ?? "");
    return <StringInput {...args} value={value} onChange={setValue} />;
  },
};

export const Email: Story = {
  args: {
    type: "email",
    name: "email",
    value: "rock@example.com",
    placeholder: "you@example.com",
  },
  render: (args) => {
    const [value, setValue] = useState(args.value ?? "");
    return <StringInput {...args} value={value} onChange={setValue} />;
  },
};

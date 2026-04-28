import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberInput } from "./NumberInput";

const meta = {
  title: "UI/Input/NumberInput",
  component: NumberInput,
  args: {
    name: "bpm",
    value: 120,
    step: 1,
    min: 30,
    max: 300,
    sensibility: 0.2,
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
};

export const DecimalStep: Story = {
  args: {
    name: "gain",
    value: 0.5,
    step: 0.1,
    min: 0,
    max: 1,
    sensibility: 0.01,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <NumberInput {...args} value={value} onChange={setValue} />;
  },
};

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberInput } from "./NumberInput";
import { UiSize } from "../UiSize";

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
    size: UiSize.M,
  },
  argTypes: {
    size: {
      control: "radio",
      options: [UiSize.S, UiSize.M],
    },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    onChange: () => { },
  },
  render: (args) => {
    const [bpmValue, setBpmValue] = useState(120);
    const [gainValue, setGainValue] = useState(0.5);

    return (
      <div className="grid gap-4">
        {
          UiSize.values.map(size => <div
            key={size}
            className="grid gap-4 grid-cols-[200px_200px]"
          >
            <NumberInput
              {...args}
              size={size}
              name="bpm"
              value={bpmValue}
              step={1}
              min={30}
              max={300}
              sensibility={0.2}
              onChange={setBpmValue}
            />
            <NumberInput
              {...args}
              size={size}
              name="gain"
              value={gainValue}
              step={0.1}
              min={0}
              max={1}
              sensibility={0.01}
              onChange={setGainValue}
            />
          </div>)
        }
      </div>
    );
  },
};

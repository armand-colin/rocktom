import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StringInput } from "./StringInput";
import { UiSize } from "../UiSize";
import { FormInputField } from "../form/FormInputField";
import { Toggle } from "../toggle/Toggle";

const meta = {
  title: "UI/Input/StringInput",
  component: StringInput,
  args: {
    name: "title",
    value: "My value",
    placeholder: "Type here",
    type: "text",
    size: UiSize.M,
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["text", "email"],
    },
    size: {
      control: "radio",
      options: [UiSize.S, UiSize.M],
    },
  },
} satisfies Meta<typeof StringInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  render: (args) => {
    const [textValue, setTextValue] = useState("My value");
    const [emailValue, setEmailValue] = useState("rock@example.com");
    const [center, setCenter] = useState(false);

    return (
      <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
        <FormInputField label="Center">
          <Toggle
            value={center}
            onChange={setCenter}
          />
        </FormInputField>
        {
          UiSize.values.map(size => <div
            key={size}
            className="grid gap-4 grid-cols-[200px_200px]"
          >
            <StringInput
              {...args}
              size={size}
              type="text"
              name="title"
              value={textValue}
              placeholder="Type here"
              onChange={setTextValue}
              center={center}
            />
            <StringInput
              {...args}
              size={size}
              type="email"
              name="email"
              value={emailValue}
              placeholder="you@example.com"
              onChange={setEmailValue}
              center={center}
            />
          </div>)
        }
      </div>
    );
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconPopup } from "./IconPopup";

const meta = {
  title: "UI/IconPopup",
  component: IconPopup,
  args: {
    title: "Information",
    icon: "home",
    text: "Your settings have been saved successfully.",
  },
} satisfies Meta<typeof IconPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {};

export const Error: Story = {
  args: {
    title: "Action failed",
    icon: "close",
    text: "An error occurred while saving your changes.",
  },
};

export const WithActions: Story = {
  args: {
    title: "Unsaved changes",
    icon: "code",
    text: "You have unsaved changes. Do you want to leave without saving?",
    buttons: [
      { label: "Cancel" },
      { label: "Leave" },
    ],
  },
};

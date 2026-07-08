import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon, type IconName } from "./Icon";

const iconNames: IconName[] = [
  "home",
  "volume_up",
  "volume_off",
  "space_bar",
  "shift",
  "arrow_back",
  "code",
  "arrow_drop_down",
  "close",
  "acute",
  "instant_mix",
  "play_arrow",
  "edit",
  "more_vert",
];

const meta = {
  title: "UI/Icon",
  component: Icon,
  args: {
    name: "home",
  },
  argTypes: {
    name: {
      control: "select",
      options: iconNames,
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12 }}>Selected:</span>
        <Icon {...args} />
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {iconNames.map((name) => (
          <div
            key={name}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 90, gap: 6 }}
          >
            <Icon name={name} />
            <span style={{ fontSize: 12 }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

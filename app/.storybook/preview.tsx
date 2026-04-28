import type { Preview } from "@storybook/react-vite";
import { EngineContext } from "@niloc/ecs-react";
import { Instance } from "../src/Instance";
import "../src/index.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <EngineContext.Provider value={{ engine: Instance.engine }}>
        <Story />
      </EngineContext.Provider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

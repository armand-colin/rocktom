import * as React from "react";
import type { Preview } from "@storybook/react-vite";
import { EngineContext } from "@niloc/ecs-react";
import { Instance } from "../src/Instance";
import "../src/index.css";
import { PopupManagerView } from "../src/ui/popup/PopupManagerView";

const preview: Preview = {
  decorators: [
    (Story) => (
      <EngineContext.Provider value={{ engine: Instance.engine }}>
        <Story />
        <PopupManagerView />
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

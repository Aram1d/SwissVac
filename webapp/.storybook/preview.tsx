import React, { useEffect } from "react";
import { MantineProvider, useMantineColorScheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { addons } from "@storybook/preview-api";
import { DARK_MODE_EVENT_NAME } from "storybook-dark-mode";

import { theme } from "../src/theme";

const channel = addons.getChannel();

function ColorSchemeWrapper({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useMantineColorScheme();
  const handleColorScheme = (value: boolean) =>
    setColorScheme(value ? "dark" : "light");

  useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
    return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
  }, [channel]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}

export const decorators = [
  (renderStory: any) => (
    <ColorSchemeWrapper>{renderStory()}</ColorSchemeWrapper>
  ),
  (renderStory: any) => (
    <MantineProvider theme={theme}>{renderStory()}</MantineProvider>
  ),
];

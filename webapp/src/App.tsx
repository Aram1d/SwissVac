import { QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider, v8CssVariablesResolver } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";
import { queryClient } from "@api";

import "./App.module.css";

import { Router } from "./Router";
import { theme } from "./theme";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} cssVariablesResolver={v8CssVariablesResolver}>
        <Router />
      </MantineProvider>
    </QueryClientProvider>
  );
}

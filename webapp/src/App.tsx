import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import { Router } from './Router';
import { theme } from './theme';

import './App.module.css';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Router />
      </MantineProvider>
    </QueryClientProvider>
  );
}

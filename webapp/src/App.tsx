import { QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import { queryClient } from '@api';

import './App.module.css';

import { Router } from './Router';
import { theme } from './theme';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Router />
      </MantineProvider>
    </QueryClientProvider>
  );
}

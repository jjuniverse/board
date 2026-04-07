'use client';
import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { store } from '@/store';
import theme from '@/styles/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { CssBaseline } from '@mui/material';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
          },
        },
      })
  );

  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <MuiThemeProvider theme={theme}>
        <SCThemeProvider theme={theme}>
          <CssBaseline />
          <ReduxProvider store={store}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </ReduxProvider>
        </SCThemeProvider>
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}

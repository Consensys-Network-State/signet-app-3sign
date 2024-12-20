import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@ds3/react";
import { BrowserRouter } from "react-router";
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Router from './Router';
import { config } from './wagmi.config'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SafeAreaProvider>
      <ThemeProvider className="bg-neutral-1 color-neutral-12" config={import.meta.env.DS3}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  </StrictMode>,
)
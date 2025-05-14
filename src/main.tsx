import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@ds3/ui";
import { BrowserRouter } from "react-router";
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Router from './Router';
import { config } from './wagmi.config'
import './index.css'
import { Buffer } from 'buffer';

// Required for Veramo libraries
// Make Buffer available globally
window.Buffer = Buffer;
// Polyfill global Buffer
globalThis.Buffer = Buffer;

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SafeAreaProvider>
      <ThemeProvider config={import.meta.env.DS3}>
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
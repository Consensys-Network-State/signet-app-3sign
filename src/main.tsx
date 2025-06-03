import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@consensys/ds3";
import { BrowserRouter } from "react-router";
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Router from './Router';
import { config } from './wagmi.config'
import './index.css'
import { Buffer } from 'buffer';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorCard from './components/ErrorCard';

// Required for Veramo libraries
// Make Buffer available globally
window.Buffer = Buffer;
// Polyfill global Buffer
globalThis.Buffer = Buffer;

const queryClient = new QueryClient()

const AppFallback = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-1 p-4">
    <ErrorCard
      title="Application Error"
      message="Something went wrong with the application. Please try refreshing the page."
      retryText="Refresh Page"
      onRetry={() => window.location.reload()}
      className="max-w-md w-full"
    />
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<AppFallback />}>
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
    </ErrorBoundary>
  </StrictMode>,
)
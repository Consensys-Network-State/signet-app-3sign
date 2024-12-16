import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as Ds3Provider } from "@ds3/react";
import { BrowserRouter } from "react-router";
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Router from './Router';
import { config } from './wagmi.config'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Ds3Provider className="bg-neutral-1 color-neutral-12">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    </Ds3Provider>
  </StrictMode>,
)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LazyMotion, domAnimation } from 'motion/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { queryClient } from './lib/queryClient'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <LazyMotion features={domAnimation}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </LazyMotion>
        </QueryClientProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)


import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster />
    <SonnerToaster position="top-right" />
  </React.StrictMode>,
)

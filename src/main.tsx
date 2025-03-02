
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'

import App from './App.tsx'
import Index from './pages/Index.tsx'
import Chat from './pages/Chat.tsx'
import NotFound from './pages/NotFound.tsx'
import Profile from './pages/Profile.tsx'
import VIP from './pages/VIP.tsx'

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: 'chat',
        element: <Chat />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'vip',
        element: <VIP />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
      <SonnerToaster position="top-right" />
    </ThemeProvider>
  </React.StrictMode>,
)

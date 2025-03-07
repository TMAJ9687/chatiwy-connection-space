"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isAdminMode?: boolean
  setAdminMode?: (isAdmin: boolean) => void
  adminVisibility?: boolean
  setAdminVisibility?: (isVisible: boolean) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  
  // Admin state
  const [isAdminMode, setAdminMode] = useState<boolean>(false)
  const [adminVisibility, setAdminVisibility] = useState<boolean>(true)
  
  // Check if user is an admin
  useEffect(() => {
    const adminCheck = () => {
      const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
      setAdminMode(isAdminAuthenticated)
    }
    
    adminCheck()
    window.addEventListener('storage', adminCheck)
    
    return () => {
      window.removeEventListener('storage', adminCheck)
    }
  }, [])
  
  // Prevent admin timeout
  useEffect(() => {
    let keepAliveInterval: number | undefined
    
    if (isAdminMode) {
      // Refresh admin session every 10 minutes
      keepAliveInterval = window.setInterval(() => {
        if (sessionStorage.getItem('adminAuthenticated') === 'true') {
          // Touch the session to keep it alive
          sessionStorage.setItem('adminLastActive', new Date().toISOString())
        }
      }, 600000) // 10 minutes
    }
    
    return () => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval)
      }
    }
  }, [isAdminMode])

  useEffect(() => {
    const root = window.document.documentElement
    
    // Set the default theme to light if not specified
    if (!theme) {
      setTheme("light")
      return
    }

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    isAdminMode,
    setAdminMode,
    adminVisibility,
    setAdminVisibility
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

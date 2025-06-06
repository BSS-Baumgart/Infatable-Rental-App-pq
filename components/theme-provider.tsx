"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

interface ThemeOptions {
  accentColor: "orange" | "blue" | "green" | "purple"
  compactMode: boolean
  collapsedSidebar: boolean
  logoUrl?: string
}

type ThemeContextType = {
  themeOptions: ThemeOptions
  setThemeOptions: React.Dispatch<React.SetStateAction<ThemeOptions>>
}

export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

const defaultThemeOptions: ThemeOptions = {
  accentColor: "orange",
  compactMode: false,
  collapsedSidebar: false,
  logoUrl: "/bouncy-castle.png",
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [themeOptions, setThemeOptions] = React.useState<ThemeOptions>(defaultThemeOptions)

  // Load theme options from localStorage on mount
  React.useEffect(() => {
    const savedOptions = localStorage.getItem("theme-options")
    if (savedOptions) {
      try {
        const parsedOptions = JSON.parse(savedOptions)
        setThemeOptions(parsedOptions)
      } catch (e) {
        console.error("Failed to parse theme options", e)
      }
    }
  }, [])

  // Save theme options to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem("theme-options", JSON.stringify(themeOptions))

    // Apply accent color as CSS variable
    document.documentElement.style.setProperty(
      "--accent-color",
      themeOptions.accentColor === "orange"
        ? "rgb(249, 115, 22)"
        : themeOptions.accentColor === "blue"
          ? "rgb(59, 130, 246)"
          : themeOptions.accentColor === "green"
            ? "rgb(34, 197, 94)"
            : "rgb(168, 85, 247)", // purple
    )

    // Apply compact mode
    if (themeOptions.compactMode) {
      document.documentElement.classList.add("compact-mode")
    } else {
      document.documentElement.classList.remove("compact-mode")
    }
  }, [themeOptions])

  return (
    <ThemeContext.Provider value={{ themeOptions, setThemeOptions }}>
      <NextThemesProvider defaultTheme="light" {...props}>
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider")
  }
  return context
}

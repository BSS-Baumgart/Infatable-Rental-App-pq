"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { fetchTranslations, formatTranslation } from "./translation-service"

export type Language = "en" | "pl" | "de" | "fr"

export interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoading: boolean
  formatT: (key: string, params?: Record<string, string>) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

// Dodajmy domyślne tłumaczenia, aby uniknąć pokazywania kluczy podczas ładowania
const defaultTranslations: Record<string, string> = {
  "common.loading": "Loading...",
  "common.error": "Error",
  "nav.dashboard": "Dashboard",
  "nav.calendar": "Calendar",
  "nav.reservations": "Reservations",
  "nav.attractions": "Attractions",
  "nav.clients": "Clients",
  "nav.invoices": "Invoices",
  "nav.documents": "Documents",
  "nav.reports": "Reports",
  "nav.settings": "Settings",
  "nav.profile": "Profile",
  "nav.logout": "Logout",
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [translations, setTranslations] = useState<Record<string, string>>(defaultTranslations)
  const [isLoading, setIsLoading] = useState(true)

  // Detect browser language on initial load
  useEffect(() => {
    const detectBrowserLanguage = (): Language => {
      if (typeof window === "undefined") return "en"

      // First check localStorage for saved preference
      const savedLanguage = localStorage.getItem("language") as Language
      if (savedLanguage && ["en", "pl", "de", "fr"].includes(savedLanguage)) {
        return savedLanguage
      }

      // Then check browser language
      const browserLang = navigator.language.split("-")[0].toLowerCase()

      // Map browser language to our supported languages
      if (browserLang === "pl") return "pl"
      if (browserLang === "de") return "de"
      if (browserLang === "fr") return "fr"

      // Default to English
      return "en"
    }

    setLanguage(detectBrowserLanguage())
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadTranslations() {
      setIsLoading(true)
      try {
        if (typeof window !== "undefined") {
          // Save language preference to localStorage
          localStorage.setItem("language", language)
        }

        // Fetch translations for the selected language
        const data = await fetchTranslations(language)
        console.log(`Loaded ${Object.keys(data).length} translations for ${language}`)

        if (isMounted) {
          setTranslations(data)
        }
      } catch (error) {
        console.error("Failed to load translations:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTranslations()

    return () => {
      isMounted = false
    }
  }, [language])

  const t = (key: string): string => {
    return translations[key] || key
  }

  const formatT = (key: string, params?: Record<string, string>): string => {
    const translation = t(key)
    return formatTranslation(translation, params)
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isLoading, formatT }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

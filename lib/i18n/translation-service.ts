import { dashboardTranslations } from "./translations/dashboard"
import { reservationsTranslations } from "./translations/reservations"
import { attractionsTranslations } from "./translations/attractions"
import { calendarTranslations } from "./translations/calendar"
import { commonTranslations } from "./translations/common"
import { clientsTranslations } from "./translations/clients"
import { invoicesTranslations } from "./translations/invoices"
import { documentsTranslations } from "./translations/documents"
import { reportsTranslations } from "./translations/reports"
import { settingsTranslations } from "./translations/settings"
import { profileTranslations } from "./translations/profile"
import { notificationsTranslations } from "./translations/notifications"
import { landingTranslations } from "./translations/landing"
import { authTranslations } from "./translations/auth"
import type { Language } from "./translation-context"

// Default translations
export const translations = {
  common: commonTranslations,
  dashboard: dashboardTranslations,
  reservations: reservationsTranslations,
  attractions: attractionsTranslations,
  calendar: calendarTranslations,
  clients: clientsTranslations,
  invoices: invoicesTranslations,
  documents: documentsTranslations,
  reports: reportsTranslations,
  settings: settingsTranslations,
  profile: profileTranslations,
  notifications: notificationsTranslations,
  landing: landingTranslations,
  auth: authTranslations,
  // Dodaj tutaj nowe tłumaczenia
}

// Function to get translations for a specific language
export function getTranslations(language: Language = "en"): Record<string, string> {
  // Combine all translation records for the specified language
  const result: Record<string, string> = {}

  // Loop through each module's translations
  Object.values(translations).forEach((module) => {
    // Get the translations for the specified language or fall back to English
    const moduleTranslations = module[language] || module.en

    // Add each translation to the result
    Object.entries(moduleTranslations).forEach(([key, value]) => {
      result[key] = value
    })
  })

  return result
}

// This function is kept for backward compatibility
export async function fetchTranslations(language: Language = "en"): Promise<Record<string, string>> {
  return getTranslations(language)
}

// This is where you would implement the real API call to fetch translations from your backend
export async function fetchTranslationsFromBackend(language: Language): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/api/translations/${language}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch translations: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching translations:", error)
    // Fallback to mock data if API fails
    return getTranslations(language)
  }
}

// Funkcja do wykrywania języka przeglądarki
export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "en"

  const storedLanguage = localStorage.getItem("language") as Language
  if (storedLanguage && ["en", "pl", "de", "fr"].includes(storedLanguage)) {
    return storedLanguage as Language
  }

  const browserLang = navigator.language.split("-")[0]
  if (["en", "pl", "de", "fr"].includes(browserLang)) {
    return browserLang as Language
  }

  return "en"
}

// Funkcja do formatowania tekstu z kluczami tłumaczeń
export function formatTranslation(text: string, params?: Record<string, string>): string {
  if (!params) return text

  return text.replace(/{(\w+)}/g, (_, key) => {
    return params[key] || `{${key}}`
  })
}

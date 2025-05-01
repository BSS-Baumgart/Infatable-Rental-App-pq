export type Language = "en" | "pl" | "de" | "fr"

export type TranslationRecord = {
  [key in Language]?: {
    [key: string]: string
  }
}

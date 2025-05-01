"use client"

import { useState, useEffect } from "react"
import { Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslation, type Language } from "@/lib/i18n/translation-context"

interface LanguageSelectorProps {
  variant?: "default" | "outline" | "ghost" | "landing"
}

export function LanguageSelector({ variant = "outline" }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useTranslation()
  const [open, setOpen] = useState(false)

  // Debugowanie
  useEffect(() => {
    console.log("LanguageSelector mounted, current language:", language)
  }, [language])

  const languages: { value: Language; label: string }[] = [
    { value: "en", label: t("language.en") },
    { value: "pl", label: t("language.pl") },
    { value: "de", label: t("language.de") },
    { value: "fr", label: t("language.fr") },
  ]

  const handleSelectLanguage = (lang: Language) => {
    console.log("Changing language to:", lang)
    setLanguage(lang)
    setOpen(false)
  }

  // Uproszczona wersja dla strony głównej
  if (variant === "landing") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1"
        onClick={() => handleSelectLanguage(language === "en" ? "pl" : "en")}
      >
        <Globe className="h-4 w-4" />
        <span>{language === "en" ? "English" : "Polski"}</span>
      </Button>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="h-8 gap-1">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block">{t("common.language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => handleSelectLanguage(lang.value)}
            className="flex items-center gap-2"
          >
            {language === lang.value && <Check className="h-4 w-4" />}
            <span className={language === lang.value ? "font-medium" : ""}>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

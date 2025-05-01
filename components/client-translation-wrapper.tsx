"use client"

import type React from "react"
import { useTranslation } from "@/lib/i18n/translation-context"

interface ClientTranslationWrapperProps {
  translationKey: string
  fallback?: React.ReactNode
}

export const ClientTranslationWrapper: React.FC<ClientTranslationWrapperProps> = ({ translationKey, fallback }) => {
  const { t } = useTranslation()

  return <>{t(translationKey) || fallback || translationKey}</>
}

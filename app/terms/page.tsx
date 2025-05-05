"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "@/lib/i18n/translation-context"

export default function TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-orange-500">BouncyRent</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Regulamin</h1>

        <div className="prose dark:prose-invert max-w-none">
          <h2>1. Postanowienia ogólne</h2>
          <p>
            Niniejszy regulamin określa zasady korzystania z usług wynajmu dmuchańców oferowanych przez BouncyRent.
            Złożenie zamówienia jest równoznaczne z akceptacją niniejszego regulaminu.
          </p>

          <h2>2. Rezerwacje</h2>
          <p>
            Rezerwacji można dokonać poprzez formularz na stronie internetowej, telefonicznie lub mailowo. Rezerwacja
            jest ważna po wpłaceniu zaliczki w wysokości 30% wartości zamówienia.
          </p>

          <h2>3. Płatności</h2>
          <p>
            Płatności można dokonać przelewem bankowym, gotówką lub kartą płatniczą. Pełna płatność musi być uregulowana
            najpóźniej w dniu dostawy dmuchańca.
          </p>

          <h2>4. Anulowanie rezerwacji</h2>
          <p>
            Anulowanie rezerwacji jest możliwe do 7 dni przed planowaną datą wynajmu. W przypadku anulowania rezerwacji
            w terminie krótszym niż 7 dni, zaliczka nie podlega zwrotowi.
          </p>

          <h2>5. Odpowiedzialność</h2>
          <p>
            Klient ponosi pełną odpowiedzialność za wynajęty sprzęt w czasie trwania wynajmu. W przypadku uszkodzenia
            sprzętu, klient zobowiązany jest do pokrycia kosztów naprawy.
          </p>

          <h2>6. Bezpieczeństwo</h2>
          <p>
            Korzystanie z dmuchańców powinno odbywać się pod nadzorem osoby dorosłej. Zabrania się korzystania z
            dmuchańców osobom pod wpływem alkoholu lub innych środków odurzających.
          </p>

          <h2>7. Postanowienia końcowe</h2>
          <p>
            W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy Kodeksu Cywilnego. Wszelkie
            spory wynikające z realizacji umowy rozstrzygane będą przez sąd właściwy dla siedziby BouncyRent.
          </p>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} BouncyRent. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  )
}

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "@/lib/i18n/translation-context"

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold mb-6">Polityka Prywatności</h1>

        <div className="prose dark:prose-invert max-w-none">
          <h2>1. Informacje ogólne</h2>
          <p>
            Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych przekazanych przez
            Użytkowników w związku z korzystaniem z usług oferowanych przez BouncyRent.
          </p>

          <h2>2. Administrator danych</h2>
          <p>
            Administratorem danych osobowych jest BouncyRent z siedzibą w [adres siedziby]. Kontakt z administratorem
            możliwy jest pod adresem e-mail: contact@bouncyrent.com.
          </p>

          <h2>3. Cel i zakres zbierania danych</h2>
          <p>Dane osobowe Użytkowników są przetwarzane w celu realizacji usług wynajmu dmuchańców, w tym:</p>
          <ul>
            <li>Realizacji zamówień</li>
            <li>Obsługi reklamacji</li>
            <li>Kontaktu z Użytkownikiem</li>
            <li>Wystawienia faktury lub rachunku</li>
          </ul>

          <h2>4. Rodzaj przetwarzanych danych</h2>
          <p>Administrator przetwarza następujące dane osobowe Użytkowników:</p>
          <ul>
            <li>Imię i nazwisko</li>
            <li>Adres e-mail</li>
            <li>Numer telefonu</li>
            <li>Adres dostawy</li>
            <li>Dane do faktury (w przypadku żądania wystawienia faktury)</li>
          </ul>

          <h2>5. Okres przechowywania danych</h2>
          <p>
            Dane osobowe Użytkowników przechowywane są przez okres niezbędny do realizacji usług oraz przez okres
            wymagany przepisami prawa, w szczególności przepisami podatkowymi.
          </p>

          <h2>6. Prawa Użytkowników</h2>
          <p>Użytkownikom przysługują następujące prawa:</p>
          <ul>
            <li>Prawo dostępu do swoich danych</li>
            <li>Prawo do sprostowania danych</li>
            <li>Prawo do usunięcia danych</li>
            <li>Prawo do ograniczenia przetwarzania danych</li>
            <li>Prawo do przenoszenia danych</li>
            <li>Prawo do wniesienia sprzeciwu</li>
            <li>Prawo do wniesienia skargi do organu nadzorczego</li>
          </ul>

          <h2>7. Bezpieczeństwo danych</h2>
          <p>
            Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo danych
            osobowych, w tym ochronę przed nieuprawnionym dostępem, utratą lub zniszczeniem.
          </p>

          <h2>8. Pliki cookies</h2>
          <p>
            Strona internetowa BouncyRent wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania strony
            oraz dostosowania treści do preferencji Użytkownika. Szczegółowe informacje na temat plików cookies znajdują
            się w Polityce Cookies.
          </p>

          <h2>9. Zmiany Polityki Prywatności</h2>
          <p>
            Administrator zastrzega sobie prawo do zmiany niniejszej Polityki Prywatności. Zmiany będą publikowane na
            stronie internetowej BouncyRent.
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

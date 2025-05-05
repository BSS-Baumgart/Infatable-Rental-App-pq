"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Calendar, CheckCircle, Menu, Star, X } from "lucide-react"
import { attractions } from "@/lib/mock-data"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/lib/i18n/translation-context"
import { useState } from "react"

export default function LandingPage() {
  const { t, language } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-orange-500">BouncyRent</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/#attractions"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            >
              {t("nav.attractions")}
            </Link>
            <Link
              href="/#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            >
              {t("nav.howItWorks")}
            </Link>
            <Link
              href="/client-reservation"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
            >
              {t("nav.bookNow")}
            </Link>

            {/* Language Selector */}
            <LanguageSelector variant="landing" />

            <Link href="/login">
              <Button variant="outline" className="ml-4">
                {t("nav.login")}
              </Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              <span className="sr-only">{mobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}</span>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/#attractions"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.attractions")}
              </Link>
              <Link
                href="/#how-it-works"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.howItWorks")}
              </Link>
              <Link
                href="/client-reservation"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.bookNow")}
              </Link>
              <div className="px-3 py-2">
                <LanguageSelector variant="landing" />
              </div>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-orange-400 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.login")}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {language === "en" ? (
                <>
                  Make Your Event <span className="text-orange-500">Unforgettable</span>
                </>
              ) : (
                <>
                  Uczyń Swoje Wydarzenie <span className="text-orange-500">Niezapomnianym</span>
                </>
              )}
            </h1>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">{t("landing.hero.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/client-reservation">
                <Button size="lg" className="px-8">
                  {t("landing.hero.bookNow")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/#attractions">
                <Button variant="outline" size="lg">
                  {t("landing.hero.viewAttractions")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative">
              <img src="/colorful-kids-bounce-house.png" alt="Colorful Bounce House" className="rounded-lg shadow-xl" />
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="ml-2 font-medium">{t("landing.hero.reviews")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t("landing.howItWorks.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.howItWorks.step1.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t("landing.howItWorks.step1.description")}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-orange-500"
                >
                  <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
                  <path d="M16 2v4" />
                  <path d="M8 2v4" />
                  <path d="M3 10h7" />
                  <path d="M21.29 14.7a2.43 2.43 0 0 0-2.65-.52c-.3.12-.57.3-.8.53l-.34.34-.35-.34a2.43 2.43 0 0 0-2.65-.53c-.3.12-.56.3-.79.53-.95.94-1 2.53.2 3.74L17.5 22l3.6-3.55c1.2-1.21 1.14-2.8.19-3.74Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.howItWorks.step2.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t("landing.howItWorks.step2.description")}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.howItWorks.step3.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t("landing.howItWorks.step3.description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Attractions */}
      <section id="attractions" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t("landing.attractions.title")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {attractions.slice(0, 6).map((attraction) => (
              <div
                key={attraction.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1"
              >
                <img
                  src={
                    attraction.imageUrl || `/placeholder.svg?height=200&width=400&query=Inflatable ${attraction.name}`
                  }
                  alt={attraction.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{attraction.name}</h3>
                  <div className="flex items-center mb-2">
                    <span className="text-orange-500 font-bold text-lg">${attraction.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">{t("landing.attractions.perDay")}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{attraction.description}</p>
                  <Link href="/client-reservation">
                    <Button className="w-full">{t("attractions.bookNow")}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/client-reservation">
              <Button variant="outline" size="lg">
                {t("landing.attractions.viewAll")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t("landing.testimonials.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <div className="flex mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("landing.testimonials.1.text")}</p>
              <div className="font-medium">{t("landing.testimonials.1.author")}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <div className="flex mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("landing.testimonials.2.text")}</p>
              <div className="font-medium">{t("landing.testimonials.2.author")}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <div className="flex mb-4">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("landing.testimonials.3.text")}</p>
              <div className="font-medium">{t("landing.testimonials.3.author")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-orange-500">BouncyRent</h3>
              <p className="text-gray-400">{t("landing.footer.description")}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{t("landing.footer.quickLinks")}</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/#attractions" className="text-gray-400 hover:text-orange-400">
                    {t("nav.attractions")}
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="text-gray-400 hover:text-orange-400">
                    {t("nav.howItWorks")}
                  </Link>
                </li>
                <li>
                  <Link href="/client-reservation" className="text-gray-400 hover:text-orange-400">
                    {t("nav.bookNow")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-orange-400">
                    {t("landing.footer.terms")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-orange-400">
                    {t("landing.footer.privacy")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      {/* Rest of the page content */}
    </div>
  )
}

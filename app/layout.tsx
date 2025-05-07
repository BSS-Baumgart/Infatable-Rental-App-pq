import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import { TranslationProvider } from "@/lib/i18n/translation-context";
import { NotificationProvider } from "@/lib/contexts/notification-context";
import { NotificationToast } from "@/components/notifications/notification-toast";
import "react-datepicker/dist/react-datepicker.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BouncyRent - Bounce House Rental Management",
  description: "Manage your bounce house rental business with ease",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TranslationProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <NotificationProvider>
                {children}
                <Toaster />
                <NotificationToast />
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}

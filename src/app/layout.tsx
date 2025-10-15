import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import { Providers } from "./providers";
import { UserProvider } from "@/contexts/UserContext";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeSwitch from "@/components/ThemeSwitch/ThemeSwitch";

import "./globals.css";
import CookieConsentDialog from "@/components/CookieConsentDialog/CookieConsentDialog";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lavandaria das Corujas",
  description: "Reservas da máquina e secadora da Vila das Corujas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${openSans.variable} antialiased`}
      >
        <Providers>
          <UserProvider>
            <ThemeProvider defaultTheme="system">
              <main>
                <ThemeSwitch />
                {children}
                <Toaster richColors closeButton position="bottom-right" />
                <CookieConsentDialog />
              </main>
            </ThemeProvider>
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}

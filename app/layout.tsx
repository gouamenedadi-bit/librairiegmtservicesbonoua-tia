import type { Metadata } from "next";
import { Barlow_Condensed, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { getLocale } from "@/lib/i18n/get-locale";
import { LocaleProvider } from "@/lib/i18n/locale-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for headings: a bold condensed sans close to the
// "GMT SERVICES BONOUA" lettering on the shop logo's yellow plate.
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const siteName = "TIA Librairie — GMT Services Bonoua";
const siteDescription =
  "Librairie et papeterie en ligne à Bonoua : romans, littérature scolaire et religieuse, fournitures de bureau et papeterie, livrés près de chez vous.";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: "%s — TIA Librairie",
  },
  description: siteDescription,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}

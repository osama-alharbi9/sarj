import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Noto_Nastaliq_Urdu } from "next/font/google";
import { LauncherBar } from "@/components/LauncherBar";
import { CaseStoreProvider } from "@/lib/caseStore";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";

/* Arabic-first: the UI font is Arabic, Latin is the guest. */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-ar",
  display: "swap",
});

/* Latin run: reference numbers, plates, clocks, durations, SARJ AI labels. */
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

/* Urdu caller lines — the calligraphic script makes the language switch obvious. */
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nastaliq",
  display: "swap",
});

/* English is the default locale, so the tab ships English; LocaleProvider
   re-titles it when the presenter switches to Arabic. */
export const metadata: Metadata = {
  title: "Najm × Sarj AI — Voice Intake",
  description: "Najm Voice Intake — powered by Sarj AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // English is primary, so the document ships LTR; LocaleProvider flips
    // lang/dir on the root when the presenter switches to Arabic.
    <html
      lang="en"
      dir="ltr"
      className={`${plexArabic.variable} ${plex.variable} ${nastaliq.variable}`}
    >
      <body>
        {/* One case list across both internal seats: an escalation raised on the
            investigator's desk is already waiting in the supervisor's queue. */}
        <LocaleProvider>
          <CaseStoreProvider>
            <div className="flex min-h-screen flex-col">
              <LauncherBar />
              {children}
            </div>
          </CaseStoreProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * English is the primary locale; Arabic is one switch away.
 *
 * The line this draws matters: UI copy and anything the *model wrote*
 * (summaries, narratives, the contradiction table) follow the operator's
 * locale. Anything the *caller said* does not — a translated transcript is not
 * a verbatim record, and the whole point of the product is that he spoke Urdu.
 * So transcripts stay in their original script and the gloss beneath them
 * switches instead.
 */

export type Locale = "en" | "ar";

/** A string the model produced or the UI owns: exists in both locales. */
export type L = { en: string; ar: string };

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  dir: "ltr" | "rtl";
  /** Pick the current locale out of a bilingual value. */
  p: (v: L) => string;
  /** Numerals: Arabic-Indic under ar, Latin under en. */
  n: (v: number | string) => string;
}

const LocaleCtx = createContext<Ctx | null>(null);
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const KEY = "najm-locale";

/**
 * The browser tab. It is set from the server in layout.tsx (English, since that
 * is the default), and re-set here when the presenter switches — metadata is
 * rendered once and cannot follow a client-side locale change on its own.
 * Kept in this file rather than strings.ts to avoid a circular import.
 */
const TITLES: Record<Locale, string> = {
  en: "Najm × Sarj AI — Voice Intake",
  ar: "نجم × Sarj AI — مساعد البلاغات الصوتي",
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  /**
   * English is the primary language, and the app ALWAYS opens in it.
   *
   * The choice is deliberately not persisted. This is a demo that gets opened
   * cold on a projector: a presenter who previewed Arabic last week should not
   * find an Arabic app in front of a room expecting English. Arabic is a switch
   * you throw during the demo, not a preference that follows you around.
   *
   * Clears the key older builds wrote, so nobody is stuck with a stale one.
   */
  useEffect(() => {
    window.localStorage.removeItem(KEY);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";

    // Next renders <title> from static metadata and re-asserts it after
    // hydration, which lands *after* this effect and overwrites us. Watch the
    // node and put our title back rather than racing it with a timeout.
    const want = TITLES[locale];
    document.title = want;

    const el = document.querySelector("title");
    if (!el) return;

    const obs = new MutationObserver(() => {
      if (document.title !== want) document.title = want;
    });
    obs.observe(el, { childList: true, characterData: true, subtree: true });
    return () => obs.disconnect();
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const dir = locale === "ar" ? "rtl" : "ltr";
  const p = useCallback((v: L) => v[locale], [locale]);
  const n = useCallback(
    (v: number | string) =>
      locale === "ar" ? String(v).replace(/\d/g, (d) => AR_DIGITS[Number(d)]) : String(v),
    [locale]
  );

  return (
    <LocaleCtx.Provider value={{ locale, setLocale, dir, p, n }}>{children}</LocaleCtx.Provider>
  );
}

export function useLocale() {
  const c = useContext(LocaleCtx);
  if (!c) throw new Error("useLocale must be used inside LocaleProvider");
  return c;
}

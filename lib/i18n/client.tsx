"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale, type TranslationKey, isLocale, t } from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translate: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function persistLocale(locale: Locale) {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    localStorage.setItem(LOCALE_COOKIE, locale);
  }
}

function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;

  const local = localStorage.getItem(LOCALE_COOKIE);
  if (isLocale(local)) return local;

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];

  if (isLocale(cookie)) return cookie;
  return null;
}

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale() ?? initialLocale ?? DEFAULT_LOCALE);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: (next) => {
        setLocaleState(next);
        persistLocale(next);
      },
      translate: (key) => t(locale, key),
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return ctx;
}

import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale, isLocale } from "@/lib/i18n";

const SK_COUNTRIES = new Set(["SK"]);

function parseAcceptLanguage(value: string | null): Locale | null {
  if (!value) return null;
  const lang = value.toLowerCase();
  if (lang.includes("sk")) return "sk";
  if (lang.includes("en")) return "en";
  return null;
}

function localeFromCountry(country: string | null): Locale | null {
  if (!country) return null;
  if (SK_COUNTRIES.has(country.toUpperCase())) return "sk";
  return "en";
}

function getCountryHeaderValue(allHeaders: Headers): string | null {
  return (
    allHeaders.get("x-vercel-ip-country") ||
    allHeaders.get("cf-ipcountry") ||
    allHeaders.get("x-country-code") ||
    null
  );
}

export async function resolveLocaleFromRequest(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const allHeaders = await headers();
  const byCountry = localeFromCountry(getCountryHeaderValue(allHeaders));
  if (byCountry) return byCountry;

  const byAcceptLanguage = parseAcceptLanguage(allHeaders.get("accept-language"));
  if (byAcceptLanguage) return byAcceptLanguage;

  return DEFAULT_LOCALE;
}

export function resolveLocaleFromHeaders(allHeaders: Headers): Locale {
  const cookieHeader = allHeaders.get("cookie") || "";
  const cookieLocale = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];

  if (isLocale(cookieLocale)) return cookieLocale;

  const byCountry = localeFromCountry(getCountryHeaderValue(allHeaders));
  if (byCountry) return byCountry;

  const byAcceptLanguage = parseAcceptLanguage(allHeaders.get("accept-language"));
  if (byAcceptLanguage) return byAcceptLanguage;

  return DEFAULT_LOCALE;
}

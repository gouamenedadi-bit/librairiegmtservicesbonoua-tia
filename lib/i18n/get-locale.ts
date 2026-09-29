import "server-only";
import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "./dictionary";

/** Server Components/Actions: resolve the visitor's language from their cookie. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return (LOCALES as string[]).includes(value ?? "") ? (value as Locale) : DEFAULT_LOCALE;
}

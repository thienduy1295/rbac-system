import "server-only";
import { cookies } from "next/headers";
import type { Locale, Dictionary } from "./types";

export type { Locale, Dictionary };

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("../../messages/en.json").then((m) => m.default as Dictionary),
  vi: () => import("../../messages/vi.json").then((m) => m.default as Dictionary),
};

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value;
  return locale === "vi" ? "vi" : "en";
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

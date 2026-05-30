import type { SupportedLocale } from "@/lib/types";

export const supportedLocales = ["ko", "ja", "en"] as const;

export const localeLabels: Record<SupportedLocale, string> = {
  ko: "한국어",
  ja: "日本語",
  en: "English",
};

export const readerNavLabels: Record<
  SupportedLocale,
  {
    recommended: string;
    popular: string;
    my: string;
  }
> = {
  ko: {
    recommended: "추천",
    popular: "인기",
    my: "MY",
  },
  ja: {
    recommended: "おすすめ",
    popular: "人気",
    my: "MY",
  },
  en: {
    recommended: "Feed",
    popular: "Hot",
    my: "MY",
  },
};

export const localeToggleLabels: Record<SupportedLocale, string> = {
  ko: "KR",
  ja: "JP",
  en: "EN",
};

export function nextLocale(locale: SupportedLocale): SupportedLocale {
  if (locale === "ko") {
    return "ja";
  }

  if (locale === "ja") {
    return "en";
  }

  return "ko";
}

export function parseLocale(value?: string | null): SupportedLocale | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().split(/[,-]/)[0];

  return supportedLocales.includes(normalized as SupportedLocale)
    ? (normalized as SupportedLocale)
    : null;
}

export function normalizeLocale(value?: string | null): SupportedLocale {
  return parseLocale(value) ?? "ko";
}

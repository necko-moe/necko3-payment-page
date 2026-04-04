import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en/translation.json";
import ru from "@/locales/ru/translation.json";
import uk from "@/locales/uk/translation.json";
import zh from "@/locales/zh/translation.json";

const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  ru: "ru-RU",
  uk: "uk-UA",
  zh: "zh-CN",
};

function syncHtmlLang(lng: string) {
  document.documentElement.lang = LOCALE_MAP[lng] ?? lng;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uk: { translation: uk },
      zh: { translation: zh },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ru", "uk", "zh"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

syncHtmlLang(i18n.language);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;

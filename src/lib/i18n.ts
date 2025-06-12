import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpApi) // Load translations from public/locales
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next)
  .init({
    supportedLngs: ["fa"],
    fallbackLng: "fa",
    debug: false, // Set to true for debugging
    interpolation: {
      escapeValue: false, // React already prevents XSS
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // Load separate files per module
    },
    ns: ["common"], // Default namespace
    defaultNS: "common",
  });

export default i18n;

import i18next from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import I18NextHttpBackend from 'i18next-http-backend';

import { initReactI18next } from 'react-i18next';

i18next
  .use(initReactI18next)
  .use(I18NextHttpBackend)
  .use(I18nextBrowserLanguageDetector)
  .init({
    debug: true,
    lng: 'eng',
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  });

export default i18next;
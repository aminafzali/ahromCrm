import React from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';

interface I18nProviderProps {
  children: React.ReactNode;
  resources: {
    [language: string]: {
      translation: {
        [key: string]: string;
      };
    };
  };
  defaultLanguage?: string;
}

const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  resources,
  defaultLanguage = 'en'
}) => {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLanguage,
      interpolation: {
        escapeValue: false
      }
    });

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

export default I18nProvider;
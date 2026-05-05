import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languageOptions } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('agrisync_language');
    return saved && ['english', 'hausa', 'yoruba', 'igbo'].includes(saved) ? saved : 'english';
  });

  useEffect(() => {
    localStorage.setItem('agrisync_language', language);
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations.english[key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageOptions }}>
      {children}
    </LanguageContext.Provider>
  );
};
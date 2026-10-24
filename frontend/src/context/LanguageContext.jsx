import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languages } from '../i18n/translations';
import { useAuth } from './AuthContext';
import { updateMeApi } from '../api/auth';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState(
    () => localStorage.getItem('maruthuvam_language') || 'English'
  );

  useEffect(() => {
    if (user?.preferred_language && user.preferred_language !== language) {
      setLanguage(user.preferred_language);
      localStorage.setItem('maruthuvam_language', user.preferred_language);
    }
  }, [user]);

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('maruthuvam_language', newLang);
    if (user) {
      try {
        await updateMeApi({ preferred_language: newLang });
      } catch (err) {
        // silent fallback
      }
    }
  };

  const t = (key) => {
    const currentDict = translations[language] || translations['English'];
    return currentDict[key] || translations['English'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

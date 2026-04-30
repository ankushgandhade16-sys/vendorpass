import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';
import axios from 'axios';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('preferredLanguage') || 'en');
  
  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('preferredLanguage', newLang);
    
    // If user is logged in, sync with backend
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post('/api/auth/update-preference', { language: newLang }, { headers: { 'x-auth-token': token } });
      } catch (err) {
        console.error('Failed to sync language with backend', err);
      }
    }
  };

  // Sync with user profile on load if logged in
  useEffect(() => {
    const syncLanguage = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/api/auth/me', { headers: { 'x-auth-token': token } });
          if (res.data.language && res.data.language !== language) {
            setLanguage(res.data.language);
            localStorage.setItem('preferredLanguage', res.data.language);
          }
        } catch (err) {
          console.error('Failed to fetch user language preference', err);
        }
      }
    };
    syncLanguage();
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

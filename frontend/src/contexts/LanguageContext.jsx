import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'lang';

const DICT = {
  en: {
    language: 'Language',
    english: 'English',
    arabic: 'Arabic',
    profile: 'Profile',
    signUp: 'Sign Up',
    blockedPhones: 'Blocked Phones',
    createNewUser: 'Create New User',
  },
  ar: {
    language: 'اللغة',
    english: 'الإنجليزية',
    arabic: 'العربية',
    profile: 'الملف الشخصي',
    signUp: 'تسجيل',
    blockedPhones: 'أرقام محظورة',
    createNewUser: 'إنشاء مستخدم جديد',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const value = useMemo(() => {
    const t = (key) => {
      const table = DICT[lang] || DICT.en;
      return table[key] || DICT.en[key] || key;
    };

    const toggle = () => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));

    return { lang, setLang, toggle, t, isRTL: lang === 'ar' };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
};

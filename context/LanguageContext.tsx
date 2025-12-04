"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

// 1. The Dictionary (Add more text here as you need)
const translations = {
  en: {
    hero_title: "Learn English With The Right Teacher",
    hero_sub: "Find qualified English tutors, book lessons instantly, and start learning.",
    btn_find: "Find a Teacher",
    btn_become: "Become a Tutor",
    features_title: "Why Choose Us?",
    packages_title: "Teacher Advertising Plans",
    view_details: "View Details",
    footer_rights: "All rights reserved.",
    // Add more keys as needed...
  },
  fr: {
    hero_title: "Apprenez l'anglais avec le bon professeur",
    hero_sub: "Trouvez des tuteurs d'anglais qualifiés, réservez des leçons instantanément et commencez à apprendre.",
    btn_find: "Trouver un prof",
    btn_become: "Devenir tuteur",
    features_title: "Pourquoi nous choisir ?",
    packages_title: "Plans Publicitaires pour Enseignants",
    view_details: "Voir les détails",
    footer_rights: "Tous droits réservés.",
  }
};

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en; // The active translation object
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
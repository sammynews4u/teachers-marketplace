"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// --- FULL DICTIONARY ---
const translations = {
  en: {
    // NAVBAR
    nav_find: "Find Teachers",
    nav_become: "Become a Tutor",
    nav_signin: "Sign In",
    
    // HERO
    hero_title: "Learn English With The Right Teacher",
    hero_sub: "Find qualified English tutors, book lessons instantly, and start learning.",
    hero_btn_find: "Find a Teacher",
    hero_btn_become: "Become a Tutor",
    badge_online: "100% Online",
    badge_verified: "Verified Teachers",
    badge_safe: "Safe Payment",

    // SECTIONS
    student_title: "For Students",
    teacher_title: "For Teachers",
    features_title: "Why Choose Us?",
    top_teachers: "Top Teachers",
    packages_title: "Teacher Plans",
    faq_title: "Frequently Asked Questions",
    ready_title: "Ready to Start?",

    // FOOTER
    footer_about: "About Us",
    footer_works: "How It Works",
    footer_terms: "Terms & Conditions",
    footer_privacy: "Privacy Policy",
    footer_contact: "Contact Support",
    footer_rights: "All rights reserved.",

    // COMMON
    view_profile: "View Profile",
    view_details: "View Details",
    loading: "Loading...",
    no_data: "No data found."
  },
  fr: {
    // NAVBAR
    nav_find: "Trouver des profs",
    nav_become: "Devenir Tuteur",
    nav_signin: "Connexion",
    
    // HERO
    hero_title: "Apprenez l'anglais avec le bon professeur",
    hero_sub: "Trouvez des tuteurs qualifiés, réservez des leçons instantanément et commencez à apprendre.",
    hero_btn_find: "Trouver un prof",
    hero_btn_become: "Devenir Tuteur",
    badge_online: "100% En Ligne",
    badge_verified: "Profs Vérifiés",
    badge_safe: "Paiement Sécurisé",

    // SECTIONS
    student_title: "Pour les Étudiants",
    teacher_title: "Pour les Professeurs",
    features_title: "Pourquoi nous choisir ?",
    top_teachers: "Meilleurs Professeurs",
    packages_title: "Plans Professeurs",
    faq_title: "Questions Fréquentes",
    ready_title: "Prêt à commencer ?",

    // FOOTER
    footer_about: "À propos",
    footer_works: "Comment ça marche",
    footer_terms: "Conditions Générales",
    footer_privacy: "Politique de Confidentialité",
    footer_contact: "Contactez-nous",
    footer_rights: "Tous droits réservés.",

    // COMMON
    view_profile: "Voir le profil",
    view_details: "Voir les détails",
    loading: "Chargement...",
    no_data: "Aucune donnée trouvée."
  }
};

type LanguageContextType = {
  t: typeof translations.en;
  language: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('en');
  // Dynamic translation object based on state
  const t = language === 'fr' ? translations.fr : translations.en;

  return (
    <LanguageContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
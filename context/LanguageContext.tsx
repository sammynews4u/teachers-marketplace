"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

const translations = {
  en: {
    // NAVBAR
    nav_find: "Find Teachers",
    nav_become: "Become a Tutor",
    nav_signin: "Sign In",
    
    // HERO SECTION
    hero_title: "Learn English With The Right Teacher — Anytime, Anywhere",
    hero_sub: "Find qualified English tutors, book lessons instantly, and start learning. Teachers can join, advertise, and get students fast.",
    btn_find: "Find a Teacher",
    btn_become: "Become a Tutor",
    badge_online: "100% Online Lessons",
    badge_verified: "Verified Teachers",
    badge_safe: "Safe Payment Options",

    // STUDENT SECTION
    student_section_tag: "For Students",
    student_title: "Learn English the Easy Way",
    
    step_1_title: "Search & Compare",
    step_1_desc: "Browse profiles, check experience, prices, reviews, and availability.",
    
    step_2_title: "Book a Lesson",
    step_2_desc: "Choose your schedule. Pay directly or through our secure gateway.",
    
    step_3_title: "Start Learning",
    step_3_desc: "Join your class through video call, chat, and shared study materials.",

    // TEACHER SECTION
    teacher_section_tag: "For Teachers",
    teacher_title: "Grow Your Teaching Business",
    
    t_step_1_title: "Create Profile",
    t_step_1_desc: "Add your experience, pricing, availability, intro video, and subjects.",
    
    t_step_2_title: "Get Paid",
    t_step_2_desc: "Receive payments directly from students OR use our platform payment system.",
    
    t_step_3_title: "Get Students",
    t_step_3_desc: "Boost your profile with Ad Packages or pay for the exact number of students you want.",

    // FEATURES
    features_title: "Why Choose Our Platform?",
    feat_1_title: "Verified Teachers",
    feat_1_desc: "Manually screened for quality.",
    feat_2_title: "Flexible Payments",
    feat_2_desc: "Pay directly or via platform.",
    feat_3_title: "Teacher Ads",
    feat_3_desc: "Teachers get promoted to students.",
    feat_4_title: "Mobile Friendly",
    feat_4_desc: "Learn from phone or laptop.",

    // TOP TEACHERS
    teachers_title: "Meet Our Top English Teachers",
    teachers_sub: "Discover experienced and certified English tutors ready to help you speak confidently.",
    view_profile: "View Profile",
    view_all: "View All Teachers",
    loading_teachers: "Loading teachers...",

    // PACKAGES
    packages_title: "Teacher Advertising Plans",
    no_packages: "No packages configured yet.",
    view_plan: "View Plan Details",
    recommended: "Recommended",

    // FAQ
    faq_tag: "Support",
    faq_title: "Frequently Asked Questions",
    no_faq: "No questions added yet.",

    // CTA
    cta_title: "Ready to Learn or Teach English?",

    // FOOTER
    footer_about: "About Us",
    footer_works: "How It Works",
    footer_terms: "Terms & Conditions",
    footer_privacy: "Privacy Policy",
    footer_contact: "Contact Support",
    footer_rights: "All rights reserved."
  },
  fr: {
    // NAVBAR
    nav_find: "Trouver des Profs",
    nav_become: "Devenir Tuteur",
    nav_signin: "Connexion",
    
    // HERO SECTION
    hero_title: "Apprenez l'anglais avec le bon professeur — N'importe quand",
    hero_sub: "Trouvez des tuteurs qualifiés, réservez des leçons instantanément et commencez à apprendre.",
    btn_find: "Trouver un Prof",
    btn_become: "Devenir Tuteur",
    badge_online: "100% En Ligne",
    badge_verified: "Profs Vérifiés",
    badge_safe: "Paiement Sécurisé",

    // STUDENT SECTION
    student_section_tag: "Pour les Étudiants",
    student_title: "Apprendre l'anglais facilement",
    
    step_1_title: "Chercher & Comparer",
    step_1_desc: "Parcourez les profils, vérifiez l'expérience, les prix et les avis.",
    
    step_2_title: "Réserver une leçon",
    step_2_desc: "Choisissez votre horaire. Payez directement ou via notre passerelle sécurisée.",
    
    step_3_title: "Commencer à apprendre",
    step_3_desc: "Rejoignez votre cours par appel vidéo et partagez des supports d'étude.",

    // TEACHER SECTION
    teacher_section_tag: "Pour les Professeurs",
    teacher_title: "Développez votre activité",
    
    t_step_1_title: "Créer un Profil",
    t_step_1_desc: "Ajoutez votre expérience, vos tarifs, vos disponibilités et vos sujets.",
    
    t_step_2_title: "Être Payé",
    t_step_2_desc: "Recevez les paiements directement des étudiants ou via notre plateforme.",
    
    t_step_3_title: "Trouver des Étudiants",
    t_step_3_desc: "Boostez votre profil avec des publicités ou payez pour obtenir des étudiants.",

    // FEATURES
    features_title: "Pourquoi nous choisir ?",
    feat_1_title: "Profs Vérifiés",
    feat_1_desc: "Sélectionnés manuellement pour la qualité.",
    feat_2_title: "Paiements Flexibles",
    feat_2_desc: "Payez directement ou via la plateforme.",
    feat_3_title: "Publicités Profs",
    feat_3_desc: "Les profs sont mis en avant.",
    feat_4_title: "Compatible Mobile",
    feat_4_desc: "Apprenez sur téléphone ou ordinateur.",

    // TOP TEACHERS
    teachers_title: "Nos Meilleurs Professeurs",
    teachers_sub: "Découvrez des tuteurs d'anglais expérimentés et certifiés.",
    view_profile: "Voir le Profil",
    view_all: "Voir tous les profs",
    loading_teachers: "Chargement...",

    // PACKAGES
    packages_title: "Plans Publicitaires",
    no_packages: "Aucun plan configuré.",
    view_plan: "Voir les détails",
    recommended: "Recommandé",

    // FAQ
    faq_tag: "Support",
    faq_title: "Questions Fréquentes",
    no_faq: "Aucune question ajoutée.",

    // CTA
    cta_title: "Prêt à apprendre ou enseigner ?",

    // FOOTER
    footer_about: "À propos",
    footer_works: "Comment ça marche",
    footer_terms: "Conditions Générales",
    footer_privacy: "Politique de Confidentialité",
    footer_contact: "Contactez-nous",
    footer_rights: "Tous droits réservés."
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
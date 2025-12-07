"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

const translations = {
  en: {
    // --- NAVBAR ---
    nav_find: "Find Teachers",
    nav_become: "Become a Tutor",
    nav_signin: "Sign In",
    
    // --- HERO SECTION ---
    hero_title: "Master a New Language with Expert Tutors",
    hero_sub: "Choose from 10+ languages including English, French, Spanish, and more. Book instant lessons and start speaking today.",
    btn_find: "Find a Tutor",
    btn_become: "Teach a Language",
    badge_online: "100% Online Lessons",
    badge_verified: "Verified Tutors",
    badge_safe: "Safe Payment Options",

    // --- STUDENT SECTION ---
    student_section_tag: "For Students",
    student_title: "Speak Confidently in Days",
    
    step_1_title: "Search & Compare",
    step_1_desc: "Browse tutor profiles, check experience, prices, reviews, and availability.",
    
    step_2_title: "Book a Lesson",
    step_2_desc: "Choose your schedule. Pay directly or through our secure gateway.",
    
    step_3_title: "Start Speaking",
    step_3_desc: "Join your class through video call and practice speaking immediately.",

    // --- TEACHER SECTION ---
    teacher_section_tag: "For Tutors",
    teacher_title: "Teach Languages & Earn",
    
    t_step_1_title: "Create Profile",
    t_step_1_desc: "Add your experience, pricing, availability, video intro, and languages.",
    
    t_step_2_title: "Get Paid",
    t_step_2_desc: "Receive payments directly to your bank account within 24 hours.",
    
    t_step_3_title: "Get Students",
    t_step_3_desc: "Boost your profile with Ad Packages to get 5x more students.",

    // --- FEATURES ---
    features_title: "Why Choose Our Platform?",
    feat_1_title: "Verified Tutors",
    feat_1_desc: "Manually screened for quality.",
    feat_2_title: "Flexible Payments",
    feat_2_desc: "Pay per lesson or buy a course.",
    feat_3_title: "Tutor Ads",
    feat_3_desc: "Tutors get promoted to students.",
    feat_4_title: "Mobile Friendly",
    feat_4_desc: "Learn from phone, tablet or laptop.",

    // --- TOP TEACHERS ---
    teachers_title: "Meet Our Top Language Tutors",
    teachers_sub: "Discover experienced and certified language tutors ready to help you speak confidently.",
    view_profile: "View Profile",
    view_all: "View All Tutors",
    loading_teachers: "Loading tutors...",

    // --- PACKAGES ---
    packages_title: "Tutor Advertising Plans",
    no_packages: "No packages configured yet.",
    view_plan: "View Plan Details",
    recommended: "Recommended",

    // --- FAQ ---
    faq_tag: "Support",
    faq_title: "Frequently Asked Questions",
    no_faq: "No questions added yet.",

    // --- CTA ---
    cta_title: "Ready to Learn or Teach?",

    // --- FOOTER ---
    footer_about: "About Us",
    footer_works: "How It Works",
    footer_terms: "Terms & Conditions",
    footer_privacy: "Privacy Policy",
    footer_contact: "Contact Support",
    footer_rights: "All rights reserved.",

    // --- AUTH / FORMS (NEW) ---
    label_name: "Full Name",
    label_email: "Email Address",
    label_password: "Create Password",
    label_subject: "Language You Teach",
    label_location: "Your Location",
    label_rate: "Hourly Rate (₦)",
    btn_creating: "Creating Profile...",
    btn_create: "Create Tutor Profile",
    upload_photo: "Upload Profile Photo"
  },
  fr: {
    // --- NAVBAR ---
    nav_find: "Trouver des Profs",
    nav_become: "Devenir Tuteur",
    nav_signin: "Connexion",
    
    // --- HERO SECTION ---
    hero_title: "Maîtrisez une nouvelle langue avec des experts",
    hero_sub: "Choisissez parmi 10+ langues dont l'anglais, le français, l'espagnol et plus. Réservez des leçons instantanées.",
    btn_find: "Trouver un Prof",
    btn_become: "Enseigner une Langue",
    badge_online: "100% En Ligne",
    badge_verified: "Tuteurs Vérifiés",
    badge_safe: "Paiement Sécurisé",

    // --- STUDENT SECTION ---
    student_section_tag: "Pour les Étudiants",
    student_title: "Parlez avec confiance",
    
    step_1_title: "Chercher & Comparer",
    step_1_desc: "Parcourez les profils, vérifiez l'expérience, les prix et les avis.",
    
    step_2_title: "Réserver une leçon",
    step_2_desc: "Choisissez votre horaire. Payez directement ou via notre passerelle sécurisée.",
    
    step_3_title: "Commencer à parler",
    step_3_desc: "Rejoignez votre cours par appel vidéo et pratiquez immédiatement.",

    // --- TEACHER SECTION ---
    teacher_section_tag: "Pour les Tuteurs",
    teacher_title: "Enseignez et Gagnez",
    
    t_step_1_title: "Créer un Profil",
    t_step_1_desc: "Ajoutez votre expérience, vos tarifs, vos disponibilités et vos langues.",
    
    t_step_2_title: "Être Payé",
    t_step_2_desc: "Recevez les paiements directement sur votre compte bancaire sous 24h.",
    
    t_step_3_title: "Trouver des Étudiants",
    t_step_3_desc: "Boostez votre profil avec des publicités pour obtenir 5x plus d'étudiants.",

    // --- FEATURES ---
    features_title: "Pourquoi nous choisir ?",
    feat_1_title: "Tuteurs Vérifiés",
    feat_1_desc: "Sélectionnés manuellement pour la qualité.",
    feat_2_title: "Paiements Flexibles",
    feat_2_desc: "Payez par leçon ou achetez un cours.",
    feat_3_title: "Publicités Profs",
    feat_3_desc: "Les profs sont mis en avant.",
    feat_4_title: "Compatible Mobile",
    feat_4_desc: "Apprenez sur téléphone ou ordinateur.",

    // --- TOP TEACHERS ---
    teachers_title: "Nos Meilleurs Tuteurs de Langues",
    teachers_sub: "Découvrez des tuteurs expérimentés et certifiés.",
    view_profile: "Voir le Profil",
    view_all: "Voir tous les tuteurs",
    loading_teachers: "Chargement...",

    // --- PACKAGES ---
    packages_title: "Plans Publicitaires",
    no_packages: "Aucun plan configuré.",
    view_plan: "Voir les détails",
    recommended: "Recommandé",

    // --- FAQ ---
    faq_tag: "Support",
    faq_title: "Questions Fréquentes",
    no_faq: "Aucune question ajoutée.",

    // --- CTA ---
    cta_title: "Prêt à apprendre ou enseigner ?",

    // --- FOOTER ---
    footer_about: "À propos",
    footer_works: "Comment ça marche",
    footer_terms: "Conditions Générales",
    footer_privacy: "Politique de Confidentialité",
    footer_contact: "Contactez-nous",
    footer_rights: "Tous droits réservés.",

    // --- AUTH / FORMS (NEW) ---
    label_name: "Nom Complet",
    label_email: "Adresse Email",
    label_password: "Créer un Mot de Passe",
    label_subject: "Langue Enseignée",
    label_location: "Votre Localisation",
    label_rate: "Tarif Horaire (₦)",
    btn_creating: "Création en cours...",
    btn_create: "Créer Profil Tuteur",
    upload_photo: "Télécharger Photo de Profil"
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
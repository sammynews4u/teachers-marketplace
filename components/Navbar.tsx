"use client";

import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext'; // Import Hook

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  // USE THE LANGUAGE HOOK
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
              TeachersB
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/teachers" className="text-gray-600 hover:text-blue-600 font-medium transition">
              {language === 'en' ? 'Find Teachers' : 'Trouver des profs'}
            </Link>
            <Link href="/become-teacher" className="text-gray-600 hover:text-blue-600 font-medium transition">
              {language === 'en' ? 'Become a Tutor' : 'Devenir Tuteur'}
            </Link>
            
            {/* LANGUAGE SWITCHER */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-blue-600 border px-3 py-1 rounded-full"
            >
              <Globe size={16} />
              {language === 'en' ? 'EN' : 'FR'}
            </button>

            <Link 
              href="/signin" 
              className="bg-gray-900 text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-900/20"
            >
              {language === 'en' ? 'Sign In' : 'Connexion'}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button onClick={toggleLanguage} className="font-bold text-sm">
                {language.toUpperCase()}
             </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-4 shadow-lg absolute w-full left-0">
          <Link href="/teachers" className="block text-gray-600 py-2" onClick={() => setIsOpen(false)}>
             {language === 'en' ? 'Find Teachers' : 'Trouver des profs'}
          </Link>
          <Link href="/become-teacher" className="block text-gray-600 py-2" onClick={() => setIsOpen(false)}>
             {language === 'en' ? 'Become a Tutor' : 'Devenir Tuteur'}
          </Link>
          
          <Link 
            href="/signin" 
            className="block w-full text-center bg-gray-900 text-white px-5 py-3 rounded-lg font-medium"
            onClick={() => setIsOpen(false)}
          >
             {language === 'en' ? 'Sign In' : 'Connexion'}
          </Link>
        </div>
      )}
    </nav>
  );
}
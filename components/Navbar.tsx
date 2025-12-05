"use client";

import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">T</div>
            <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">TeachersB</Link>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/teachers" className="text-gray-600 hover:text-blue-600 font-medium transition">{t.nav_find}</Link>
            <Link href="/become-teacher" className="text-gray-600 hover:text-blue-600 font-medium transition">{t.nav_become}</Link>
            
            <button onClick={toggleLang} className="flex items-center gap-1 text-sm font-bold border px-3 py-1 rounded-full hover:bg-gray-100">
              <Globe size={14}/> {language.toUpperCase()}
            </button>

            <Link href="/signin" className="bg-gray-900 text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition shadow-lg">{t.nav_signin}</Link>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleLang} className="text-sm font-bold">{language.toUpperCase()}</button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-4 shadow-lg absolute w-full left-0">
          <Link href="/teachers" className="block text-gray-600 py-2">{t.nav_find}</Link>
          <Link href="/become-teacher" className="block text-gray-600 py-2">{t.nav_become}</Link>
          <Link href="/signin" className="block w-full text-center bg-gray-900 text-white px-5 py-3 rounded-lg font-medium">{t.nav_signin}</Link>
        </div>
      )}
    </nav>
  );
}
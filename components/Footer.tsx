"use client";
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-xl font-bold mb-4">TeachersB</h3>
          <p className="text-sm text-gray-400">The #1 Marketplace for English Teachers and Students.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition">{t.footer_about}</Link></li>
            <li><Link href="#" className="hover:text-white transition">{t.footer_works}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition">{t.footer_terms}</Link></li>
            <li><Link href="#" className="hover:text-white transition">{t.footer_privacy}</Link></li>
            <li><Link href="#" className="hover:text-white transition">{t.footer_contact}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <Facebook className="w-5 h-5 cursor-pointer hover:text-white transition" />
            <Twitter className="w-5 h-5 cursor-pointer hover:text-white transition" />
            <Instagram className="w-5 h-5 cursor-pointer hover:text-white transition" />
            <Mail className="w-5 h-5 cursor-pointer hover:text-white transition" />
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-600 mt-12 pt-8 border-t border-gray-800">
        © {new Date().getFullYear()} TeachersB. {t.footer_rights}
      </div>
    </footer>
  );
}
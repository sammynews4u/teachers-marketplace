"use client";

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
            <Link href="/teachers" className="text-gray-600 hover:text-blue-600 font-medium transition">Find Teachers</Link>
            <Link href="/become-teacher" className="text-gray-600 hover:text-blue-600 font-medium transition">Become a Tutor</Link>
            
            {/* THIS IS THE FIXED SIGN IN BUTTON */}
            <Link 
              href="/signin" 
              className="bg-gray-900 text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-900/20"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
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
            Find Teachers
          </Link>
          <Link href="/become-teacher" className="block text-gray-600 py-2" onClick={() => setIsOpen(false)}>
            Become a Tutor
          </Link>
          
          {/* Mobile Sign In Link */}
          <Link 
            href="/signin" 
            className="block w-full text-center bg-gray-900 text-white px-5 py-3 rounded-lg font-medium"
            onClick={() => setIsOpen(false)}
          >
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
}
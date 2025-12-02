"use client";

import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { GraduationCap, BookOpen } from 'lucide-react';

export default function SignInSelection() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome Back</h1>
          <p className="text-gray-500">Please choose how you want to log in.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          
          {/* Student Login Card */}
          <Link href="/student-login" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-600 transition-all cursor-pointer h-full text-center">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
                <BookOpen className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">I am a Student</h2>
              <p className="text-gray-500">Log in to book lessons and manage your classes.</p>
            </div>
          </Link>

          {/* Teacher Login Card */}
          <Link href="/login" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-gray-900 transition-all cursor-pointer h-full text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-900 transition-colors">
                <GraduationCap className="w-10 h-10 text-gray-700 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">I am a Teacher</h2>
              <p className="text-gray-500">Log in to manage your profile and view earnings.</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
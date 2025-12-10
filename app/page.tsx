"use client";

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext'; 
import { CheckCircle2, Video, DollarSign, Users, Search, BookOpen, ShieldCheck, Smartphone, HelpCircle, Star } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage(); 
  const [teachers, setTeachers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]); 
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch Top Teachers
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if(Array.isArray(data)) setTeachers(data.slice(0, 3));
      });

    // 2. Fetch Packages
    fetch('/api/public/packages')
      .then((res) => res.json())
      .then((data) => {
        if(Array.isArray(data)) setPackages(data);
      });

    // 3. Fetch FAQs
    fetch('/api/faqs')
      .then((res) => res.json())
      .then((data) => {
        if(Array.isArray(data)) setFaqs(data);
      });
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            {t.hero_title}
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {t.hero_sub}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="/teachers">
              <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                {t.btn_find}
              </button>
            </Link>
            <Link href="/become-teacher">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition">
                {t.btn_become}
              </button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-500">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> 100% Online Lessons</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Verified Teachers</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Safe Payment Options</span>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold tracking-wide uppercase text-sm">For Students</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Learn English the Easy Way</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Search & Compare</h3>
            <p className="text-gray-500">Browse profiles, check experience, prices, reviews, and availability.</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Book a Lesson</h3>
            <p className="text-gray-500">Choose your schedule. Pay directly or through our secure gateway.</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Start Learning</h3>
            <p className="text-gray-500">Join your class through video call, chat, and shared study materials.</p>
          </div>
        </div>
      </section>

      {/* 3. TEACHER BANNER */}
      <section className="py-20 bg-gray-900 text-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-400 font-bold tracking-wide uppercase text-sm">For Teachers</span>
            <h2 className="text-3xl font-bold mt-2">Grow Your Teaching Business</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="p-8 border border-gray-700 rounded-2xl hover:border-blue-500 transition">
              <h3 className="text-xl font-bold mb-4 text-blue-400">1. Create Profile</h3>
              <p className="text-gray-400">Add your experience, pricing, availability, intro video, and subjects.</p>
            </div>
            <div className="p-8 border border-gray-700 rounded-2xl hover:border-blue-500 transition">
              <h3 className="text-xl font-bold mb-4 text-blue-400">2. Get Paid</h3>
              <p className="text-gray-400">Receive payments directly from students OR use our platform payment system.</p>
            </div>
            <div className="p-8 border border-gray-700 rounded-2xl hover:border-blue-500 transition">
              <h3 className="text-xl font-bold mb-4 text-blue-400">3. Get Students</h3>
              <p className="text-gray-400">Boost your profile with Ad Packages or pay for the exact number of students you want.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">{t.features_title}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: ShieldCheck, title: "Verified Teachers", desc: "Manually screened for quality." },
            { icon: DollarSign, title: "Flexible Payments", desc: "Pay directly or via platform." },
            { icon: Users, title: "Teacher Ads", desc: "Teachers get promoted to students." },
            { icon: Smartphone, title: "Mobile Friendly", desc: "Learn from phone or laptop." },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="font-bold mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TOP TEACHERS (Synced with Backend) */}
      <section className="py-20 bg-blue-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Top English Teachers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover experienced and certified English tutors ready to help you speak confidently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teachers.length > 0 ? (
              teachers.map((t) => (
                <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-1">
                        {t.name}
                        {t.isVerified && <CheckCircle2 size={16} className="text-blue-500 fill-blue-50" />}
                      </h3>
                      <p className="text-blue-600 text-sm">{t.subject}</p>
                      <div className="flex items-center gap-1 text-xs text-orange-500 font-bold mt-1">
                          <Star size={12} fill="currentColor"/> {t.rating.toFixed(1)} Rating
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                    {/* CHANGED TO DOLLAR */}
                    <span className="font-bold">${t.hourlyRate}/hr</span>
                    <Link href={`/hire/${t.id}`} className="text-blue-600 font-bold text-sm hover:underline">
                      View Profile
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center w-full col-span-3 text-gray-500">Loading teachers from database...</p>
            )}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/teachers">
              <button className="px-8 py-3 border-2 border-gray-900 rounded-lg font-bold hover:bg-gray-900 hover:text-white transition">
                View All Teachers
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. DYNAMIC PACKAGES */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{t.packages_title}</h2>
        
        {packages.length === 0 ? (
          <div className="text-center text-gray-500 bg-gray-50 p-10 rounded-xl">
            <p>No packages configured yet. Go to Admin Dashboard to add plans.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`border-2 rounded-2xl p-8 text-center transition hover:shadow-xl flex flex-col justify-between ${pkg.name.toLowerCase().includes('gold') ? 'border-yellow-400 relative transform scale-105 z-10 bg-white' : 'border-gray-100 bg-white'}`}
              >
                <div>
                  {pkg.name.toLowerCase().includes('gold') && (
                    <div className="absolute top-0 inset-x-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 uppercase tracking-widest rounded-t-lg">Recommended</div>
                  )}
                  
                  <h3 className={`font-bold text-lg mb-2 mt-4 ${pkg.name.toLowerCase().includes('gold') ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {pkg.name}
                  </h3>
                  
                  {/* CHANGED TO DOLLAR */}
                  <p className="text-4xl font-bold text-gray-900 mb-4">${pkg.price}</p>
                  <p className="text-gray-500 mb-6 text-sm">{pkg.description}</p>
                  
                  <ul className="text-left space-y-3 mb-8">
                    {pkg.features.split(',').map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                        {feat.trim()}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/become-teacher">
                  <button className={`w-full py-3 rounded-xl font-bold transition ${pkg.name.toLowerCase().includes('gold') ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {t.view_details}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-20 px-4 max-w-3xl mx-auto bg-white">
        <div className="text-center mb-12">
          <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 inline-block">Support</span>
          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.length > 0 ? (
            faqs.map((faq) => (
              <div key={faq.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 transition">
                <div className="flex gap-4">
                  <div className="mt-1"><HelpCircle className="text-blue-500 w-5 h-5"/></div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-2xl border border-dashed">
              <p>No questions added by admin yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-24 bg-blue-600 text-center px-4">
        <h2 className="text-4xl font-bold text-white mb-8">Ready to Learn or Teach English?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/become-teacher">
            <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition">
              {t.btn_become}
            </button>
          </Link>
          <Link href="/teachers">
            <button className="px-8 py-4 bg-blue-700 text-white font-bold rounded-xl border border-blue-500 hover:bg-blue-800 transition">
              {t.btn_find}
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
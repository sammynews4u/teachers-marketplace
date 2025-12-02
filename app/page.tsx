"use client";

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Video, DollarSign, Users, Search, BookOpen, Star, ShieldCheck, Smartphone } from 'lucide-react';

export default function Home() {
  const [teachers, setTeachers] = useState<any[]>([]);

  // SYNC: Fetch real teachers from backend
  useEffect(() => {
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        // Only take the first 3 teachers for the homepage
        setTeachers(data.slice(0, 3));
      });
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Learn English With The Right <span className="text-blue-600">Teacher</span> <br /> Anytime, Anywhere.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Find qualified English tutors, book lessons instantly, and start learning.
            Teachers can join, advertise, and get students fast.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="/teachers">
              <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                Find a Teacher
              </button>
            </Link>
            <Link href="/become-teacher">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition">
                Become a Teacher
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

      {/* 2. HOW IT WORKS (STUDENTS) */}
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
        <div className="text-center mt-12">
          <Link href="/teachers">
            <button className="text-blue-600 font-bold hover:underline">Find My English Teacher &rarr;</button>
          </Link>
        </div>
      </section>

      {/* 3. HOW IT WORKS (TEACHERS) */}
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
          <div className="text-center mt-12">
            <Link href="/become-teacher">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-500 transition">
                Become a Teacher
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM FEATURES */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Why Choose Our Platform?</h2>
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
                <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-lg">{t.name}</h3>
                      <p className="text-blue-600 text-sm">{t.subject}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                    <span className="font-bold">₦{t.hourlyRate.toLocaleString()}/hr</span>
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

      {/* 6. PRICING OPTIONS */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Teacher Advertising Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border p-8 rounded-2xl text-center">
            <h3 className="font-bold text-lg mb-2">Bronze Plan</h3>
            <p className="text-gray-500 mb-6">Basic Visibility</p>
            <button className="w-full py-2 bg-gray-100 font-bold rounded-lg">View Details</button>
          </div>
          <div className="border-2 border-blue-600 p-8 rounded-2xl text-center relative overflow-hidden">
            <div className="bg-blue-600 text-white text-xs font-bold py-1 px-3 absolute top-0 right-0 rounded-bl-lg">POPULAR</div>
            <h3 className="font-bold text-lg mb-2 text-blue-600">Silver Plan</h3>
            <p className="text-gray-500 mb-6">High Visibility + Impressions</p>
            <button className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg">View Details</button>
          </div>
          <div className="border p-8 rounded-2xl text-center">
            <h3 className="font-bold text-lg mb-2 text-yellow-600">Gold Plan</h3>
            <p className="text-gray-500 mb-6">Maximum Visibility</p>
            <button className="w-full py-2 bg-gray-100 font-bold rounded-lg">View Details</button>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">What People Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex text-yellow-400 mb-4 justify-center"><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /></div>
              <p className="text-lg italic mb-4">"I improved my English speaking in just 3 weeks! The teachers are amazing."</p>
              <p className="font-bold text-gray-900">— Maria N., Student</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex text-yellow-400 mb-4 justify-center"><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /></div>
              <p className="text-lg italic mb-4">"The platform helped me get 12 new students in my first month. Highly recommended!"</p>
              <p className="font-bold text-gray-900">— James, Teacher</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-20 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-xl">
            <h4 className="font-bold mb-2">Can teachers collect money directly?</h4>
            <p className="text-gray-600">Yes. Teachers can choose direct payment or platform payment.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl">
            <h4 className="font-bold mb-2">How do I get students as a teacher?</h4>
            <p className="text-gray-600">Buy an ad package or pay for the number of students you want.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl">
            <h4 className="font-bold mb-2">Is registration free?</h4>
            <p className="text-gray-600">Students register free. Teachers register free but pay for advertising.</p>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-24 bg-blue-600 text-center px-4">
        <h2 className="text-4xl font-bold text-white mb-8">Ready to Learn or Teach English?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/become-teacher">
            <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition">
              Join as a Teacher
            </button>
          </Link>
          <Link href="/teachers">
            <button className="px-8 py-4 bg-blue-700 text-white font-bold rounded-xl border border-blue-500 hover:bg-blue-800 transition">
              Find a Teacher
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
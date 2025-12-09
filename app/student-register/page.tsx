"use client";
import Navbar from '../../components/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackConversion } from '../../lib/analytics';
import Link from 'next/link';

export default function StudentRegister() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/student/register', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
        trackConversion('Lead'); 
      alert("Account Created! Please Login.");
      router.push('/student-login');
    } else {
      alert("Registration failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 px-4 max-w-md mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Student Sign Up</h1>
            <Link href="/become-teacher" className="text-sm text-blue-600 font-medium hover:underline">
              Switch to Teacher
            </Link>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name" required className="w-full p-3 border rounded-lg"
              onChange={e => setForm({...form, name: e.target.value})} />
            <input type="email" placeholder="Email" required className="w-full p-3 border rounded-lg"
              onChange={e => setForm({...form, email: e.target.value})} />
            <input type="password" placeholder="Password" required className="w-full p-3 border rounded-lg"
              onChange={e => setForm({...form, password: e.target.value})} />
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Register</button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Already have an account? <Link href="/student-login" className="text-blue-600 font-bold">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
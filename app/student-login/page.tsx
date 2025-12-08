"use client";
import Navbar from '../../components/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/student/login', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('studentId', data.studentId);
      router.push('/student-dashboard'); // Send them to find teachers
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 px-4 max-w-md mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Student Login</h1>
            <Link href="/login" className="text-sm text-blue-600 font-medium hover:underline">
              Switch to Teacher
            </Link>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" required className="w-full p-3 border rounded-lg"
              onChange={e => setForm({...form, email: e.target.value})} />
            <input type="password" placeholder="Password" required className="w-full p-3 border rounded-lg"
              onChange={e => setForm({...form, password: e.target.value})} />
              <div className="text-right mb-4">
  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
    Forgot Password?
  </Link>
</div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Login</button>
          </form>
          <div className="mt-4 text-center text-sm">
             No account? <Link href="/student-register" className="text-blue-600 font-bold">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
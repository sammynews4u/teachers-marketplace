"use client";

import Navbar from '../../components/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok) {
      // Save the Teacher ID to the browser so we remember them
      localStorage.setItem('teacherId', data.teacherId);
      router.push('/teacher-dashboard');
    } else {
      alert("Invalid Email or Password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 pb-12 px-4 max-w-md mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">Teacher Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required className="w-full p-3 border rounded-lg"
                onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" required className="w-full p-3 border rounded-lg"
                onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="text-right mb-4">
  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
    Forgot Password?
  </Link>
</div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
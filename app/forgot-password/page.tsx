"use client";
import Navbar from '../../components/Navbar';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [type, setType] = useState('student'); // 'student' or 'teacher'
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
      headers: { 'Content-Type': 'application/json' }
    });

    // Always show success to prevent email scraping
    setStatus('success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 px-4 max-w-md mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
          
          {status === 'success' ? (
            <div className="text-green-600 bg-green-50 p-4 rounded-lg">
              Check your email! If an account exists, we sent a reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button type="button" onClick={() => setType('student')} className={`flex-1 py-2 rounded-md font-bold text-sm ${type === 'student' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>I am a Student</button>
                <button type="button" onClick={() => setType('teacher')} className={`flex-1 py-2 rounded-md font-bold text-sm ${type === 'teacher' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>I am a Teacher</button>
              </div>

              <input required type="email" placeholder="Enter your email" className="w-full p-3 border rounded-lg" onChange={e => setEmail(e.target.value)} />
              
              <button disabled={status === 'sending'} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
                {status === 'sending' ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
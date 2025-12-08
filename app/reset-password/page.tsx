"use client";
import Navbar from '../../components/Navbar';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, type, newPassword: password }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      alert("Password Changed! Please Login.");
      router.push(type === 'teacher' ? '/login' : '/student-login');
    } else {
      alert("Invalid or Expired Token");
    }
    setLoading(false);
  };

  if (!token) return <p className="text-center p-10">Invalid Link</p>;

  return (
    <div className="pt-32 px-4 max-w-md mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Set New Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="password" placeholder="New Password" className="w-full p-3 border rounded-lg" onChange={e => setPassword(e.target.value)} />
          <button disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<div className="text-center pt-32">Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
"use client";

import Navbar from '../../components/Navbar';
import UploadButton from '../../components/UploadButton'; // <--- NEW IMPORT
import { useState } from 'react';
import { trackConversion } from '../../lib/analytics';
import { useRouter } from 'next/navigation';

export default function BecomeTeacher() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subject: '',
    location: '',
    hourlyRate: '',
    image: '' // This will now store a URL, not base64
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.image) {
      alert("Please upload a profile photo.");
      setLoading(false);
      return;
    }

    const res = await fetch('/api/teachers', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok) {
      trackConversion('Lead');
      alert("Registration Successful! Please Login.");
      router.push('/login');
    } else {
      alert(data.error || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Teacher</h1>
          <p className="text-gray-500 mb-8">Join our community of expert tutors.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* IMAGE UPLOAD SECTION */}
            <div className="flex flex-col items-center mb-6">
              {formData.image ? (
                <div className="relative w-32 h-32">
                  <img src={formData.image} className="w-full h-full rounded-full object-cover border-4 border-blue-100" />
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, image: ''})}
                    className="absolute bottom-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <UploadButton onUpload={(url) => setFormData({...formData, image: url})} />
              )}
            </div>

            {/* FORM INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input required type="text" className="w-full px-4 py-3 rounded-lg border outline-none" 
                  onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input required type="email" className="w-full px-4 py-3 rounded-lg border outline-none" 
                  onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Create Password</label>
              <input required type="password" className="w-full px-4 py-3 rounded-lg border outline-none" 
                onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input required type="text" placeholder="e.g. English" className="w-full px-4 py-3 rounded-lg border outline-none" 
                  onChange={e => setFormData({...formData, subject: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input required type="text" placeholder="e.g. Lagos" className="w-full px-4 py-3 rounded-lg border outline-none" 
                  onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
              <input required type="number" className="w-full px-4 py-3 rounded-lg border outline-none" 
                onChange={e => setFormData({...formData, hourlyRate: e.target.value})} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">
              {loading ? 'Creating Profile...' : 'Create Teacher Profile'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
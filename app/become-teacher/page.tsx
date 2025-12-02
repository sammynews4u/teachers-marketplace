"use client";

import Navbar from '../../components/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

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
    image: ''
  });

  // Handle Image Upload (Convert to Base64)
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/teachers', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registration Successful! Please Login.");
      router.push('/login'); // We will create this page next
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
          <p className="text-gray-500 mb-8">Create your profile to start getting students.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {formData.image ? (
                  <img src={formData.image} className="w-full h-full object-cover" />
                ) : (
                  <Upload className="text-gray-400" />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <p className="text-center text-sm text-gray-500">Tap to upload profile photo</p>

            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input required type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none" 
                  onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input required type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none" 
                  onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Create Password</label>
              <input required type="password" className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none" 
                onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            {/* Subject & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input required type="text" placeholder="e.g. English" className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none" 
                  onChange={e => setFormData({...formData, subject: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input required type="text" placeholder="e.g. Lagos" className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none" 
                  onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (₦)</label>
              <input required type="number" className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none" 
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
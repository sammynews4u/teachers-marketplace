"use client";

import Navbar from '../../components/Navbar';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext'; // Import Hook

const LANGUAGES = [
  "English", "French", "Spanish", "German", 
  "Chinese", "Japanese", "Arabic", "Portuguese", 
  "Russian", "Italian", "Yoruba", "Igbo", "Hausa"
];

export default function BecomeTeacher() {
  const router = useRouter();
  const { t } = useLanguage(); // Use Translation
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', subject: '', location: '', hourlyRate: '', image: ''
  });

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, image: reader.result as string }); };
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

    if (res.ok) {
      alert("Profile Created! Please Login.");
      router.push('/login');
    } else {
      const data = await res.json();
      alert(data.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.btn_become}</h1>
          <p className="text-gray-500 mb-8">{t.teacher_title}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition cursor-pointer group">
                {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <Upload className="text-gray-400 group-hover:text-blue-500" />}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
            <p className="text-center text-sm text-gray-500">{t.upload_photo}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.label_name}</label>
                <input required type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.label_email}</label>
                <input required type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200" onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t.label_password}</label>
              <input required type="password" className="w-full px-4 py-3 rounded-lg border border-gray-200" onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.label_subject}</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <select 
                    required 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white appearance-none"
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="">Select...</option>
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.label_location}</label>
                <input required type="text" placeholder="e.g. Lagos, Nigeria" className="w-full px-4 py-3 rounded-lg border border-gray-200" onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t.label_rate}</label>
              <input required type="number" placeholder="e.g. 5000" className="w-full px-4 py-3 rounded-lg border border-gray-200" onChange={e => setFormData({...formData, hourlyRate: e.target.value})} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">
              {loading ? t.btn_creating : t.btn_create}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
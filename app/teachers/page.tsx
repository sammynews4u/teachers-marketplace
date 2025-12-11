"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Search, Filter, Star, CheckCircle2, SlidersHorizontal, Loader2, Crown, ShieldCheck } from 'lucide-react';

export default function TeachersList() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000); // Set high default to show all teachers
  const [showFilters, setShowFilters] = useState(false); // Mobile toggle

  // Fetch Function
  const fetchTeachers = () => {
    setLoading(true);
    
    // Build query string
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (location) params.append('location', location);
    if (maxPrice) params.append('maxPrice', maxPrice.toString());

    fetch(`/api/teachers?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTeachers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  // Initial Load
  useEffect(() => {
    fetchTeachers();
  }, []); 

  const handleClearFilters = () => {
    setSubject('');
    setLocation('');
    setMaxPrice(1000);
    // We need to trigger fetch, but state updates are async, so we pass empty params manually
    fetch('/api/teachers').then(res => res.json()).then(data => setTeachers(data));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Tutor</h1>
            <p className="text-gray-500">Browse verified teachers and book a lesson today.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR FILTERS --- */}
          <div className={`lg:w-1/4 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-blue-600"/>
                    <h3 className="font-bold text-gray-900">Filters</h3>
                </div>
                <button onClick={handleClearFilters} className="text-xs text-gray-400 hover:text-blue-600 underline">Reset</button>
              </div>

              <div className="space-y-6">
                {/* Subject */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Subject</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16}/>
                    <input 
                      type="text" 
                      placeholder="e.g. English, Math" 
                      className="w-full pl-10 p-3 border rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={16}/>
                    <input 
                      type="text" 
                      placeholder="e.g. Lagos, London" 
                      className="w-full pl-10 p-3 border rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Price Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Max Hourly Rate</label>
                    <span className="text-sm text-blue-600 font-bold">${maxPrice}</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="500" 
                    step="5"
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <button 
                  onClick={fetchTeachers}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* --- MAIN CONTENT (TEACHER LIST) --- */}
          <div className="lg:w-3/4">
            
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full mb-6 bg-white p-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-gray-700 shadow-sm"
            >
              <SlidersHorizontal size={18}/> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <Search className="mx-auto h-12 w-12 text-gray-300 mb-4"/>
                <h3 className="text-lg font-bold text-gray-900">No teachers found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search for a different subject.</p>
                <button 
                  onClick={handleClearFilters}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className={`bg-white rounded-2xl shadow-sm border hover:shadow-lg transition overflow-hidden flex flex-col group ${teacher.plan === 'gold' ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-100'}`}>
                    
                    {/* Badge */}
                    {teacher.plan === 'gold' && <div className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 text-center uppercase tracking-widest flex items-center justify-center gap-1"><Crown size={12}/> Recommended</div>}
                    
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                          <img 
                            src={teacher.image || `https://api.dicebear.com/7.x/initials/svg?seed=${teacher.name}`} 
                            alt={teacher.name} 
                            className="w-16 h-16 rounded-full object-cover border-4 border-gray-50 group-hover:scale-105 transition"
                          />
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1">
                              {teacher.name}
                              {teacher.isVerified && <CheckCircle2 size={16} className="text-blue-500 fill-blue-50"/>}
                            </h3>
                            <p className="text-blue-600 font-medium text-sm mb-1">{teacher.subject}</p>
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                              <Star size={12} className="text-orange-400 fill-orange-400"/> {teacher.rating?.toFixed(1) || "5.0"}
                              <span className="text-gray-300">•</span>
                              <span>{teacher.bookings?.length || 0} Students</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-500 text-sm mb-4 bg-gray-50 p-2 rounded-lg w-fit">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        {teacher.location}
                      </div>
                      
                      {/* Plan Badges */}
                      {teacher.plan === 'silver' && <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold border"><ShieldCheck size={10}/> FEATURED</span>}

                    </div>

                    <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50 group-hover:bg-white transition">
                      <div>
                        <span className="block text-xl font-bold text-gray-900">${teacher.hourlyRate}</span>
                        <span className="text-xs text-gray-400 font-medium">per hour</span>
                      </div>
                      <Link href={`/hire/${teacher.id}`}>
                        <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition shadow-lg shadow-gray-900/10">
                          View Profile
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
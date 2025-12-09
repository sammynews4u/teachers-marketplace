"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Search, Filter, Star, CheckCircle2, SlidersHorizontal } from 'lucide-react';

export default function TeachersList() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState(100); // Default max $100
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
        setTeachers(data);
        setLoading(false);
      });
  };

  // Initial Load
  useEffect(() => {
    fetchTeachers();
  }, []); // Run once on mount

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Tutor</h1>
        <p className="text-gray-500 mb-8">Browse verified teachers and book a lesson today.</p>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR FILTERS --- */}
          <div className={`lg:w-1/4 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            
            {/* Search Box */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={20} className="text-blue-600"/>
                <h3 className="font-bold text-gray-900">Filters</h3>
              </div>

              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Subject</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16}/>
                    <input 
                      type="text" 
                      placeholder="e.g. English, Math" 
                      className="w-full pl-10 p-2.5 border rounded-lg text-sm outline-none focus:border-blue-500"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={16}/>
                    <input 
                      type="text" 
                      placeholder="e.g. Lagos, London" 
                      className="w-full pl-10 p-2.5 border rounded-lg text-sm outline-none focus:border-blue-500"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Price Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700">Max Price</label>
                    <span className="text-sm text-blue-600 font-bold">${maxPrice}/hr</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="200" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>$5</span>
                    <span>$200+</span>
                  </div>
                </div>

                <button 
                  onClick={fetchTeachers}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
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
              className="lg:hidden w-full mb-4 bg-white p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-gray-700 shadow-sm"
            >
              <SlidersHorizontal size={18}/> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>)}
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No teachers found matching your criteria.</p>
                <button 
                  onClick={() => { setSubject(''); setLocation(''); setMaxPrice(200); fetchTeachers(); }}
                  className="text-blue-600 font-bold mt-2 hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden flex flex-col ${teacher.plan === 'gold' ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-100'}`}>
                    
                    {/* Badge */}
                    {teacher.plan === 'gold' && <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 text-center">RECOMMENDED</div>}
                    
                    <div className="p-5 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <img 
                            src={teacher.image} 
                            alt={teacher.name} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                          />
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1">
                              {teacher.name}
                              {teacher.isVerified && <CheckCircle2 size={16} className="text-blue-500 fill-blue-50"/>}
                            </h3>
                            <p className="text-blue-600 font-medium text-sm">{teacher.subject}</p>
                            <div className="flex items-center gap-1 text-xs text-orange-500 font-bold mt-1">
                              <Star size={12} fill="currentColor"/> {teacher.rating.toFixed(1)} Rating
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-xl font-bold text-gray-900">${teacher.hourlyRate}</span>
                          <span className="text-xs text-gray-400">/ hour</span>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-500 text-sm mb-4">
                        <MapPin size={16} className="mr-1" />
                        {teacher.location}
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-gray-50">
                      <Link href={`/hire/${teacher.id}`}>
                        <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition">
                          View Profile & Hire
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
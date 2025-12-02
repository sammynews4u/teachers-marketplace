"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';

// Define what a Teacher looks like
interface Teacher {
  id: string;
  name: string;
  subject: string;
  location: string;
  hourlyRate: number;
  image: string;
  isVerified: boolean;
}

export default function TeachersList() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch teachers from our API when page loads
  useEffect(() => {
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        setTeachers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Teachers</h1>

        {loading ? (
          <p>Loading teachers...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden">
                
                {/* Image Section */}
                <div className="h-48 w-full bg-gray-200 relative">
                  <img 
                    src={teacher.image} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover"
                  />
                  {teacher.isVerified && (
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-blue-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                       Verified
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
                      <p className="text-blue-600 font-medium text-sm">{teacher.subject}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-bold text-gray-900">₦{teacher.hourlyRate.toLocaleString()}</span>
                      <span className="text-xs text-gray-400">/hr</span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin size={16} className="mr-1" />
                    {teacher.location}
                  </div>

                  {/* Hire Button */}
                  <Link href={`/hire/${teacher.id}`}>
                    <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition">
                      Hire Teacher
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {teachers.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500">No teachers found yet.</p>
            <Link href="/become-teacher" className="text-blue-600 font-bold hover:underline">
              Be the first to join!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
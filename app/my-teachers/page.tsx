"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Video, Calendar } from 'lucide-react';

export default function MyTeachers() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      router.push('/student-login');
      return;
    }

    fetch('/api/student/bookings', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Hired Teachers</h1>

        {loading ? (
          <p>Loading your classes...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 mb-4">You haven't hired any teachers yet.</p>
            <button 
              onClick={() => router.push('/teachers')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
            >
              Find a Teacher
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                
                {/* Teacher Image */}
                <img 
                  src={booking.teacher.image} 
                  alt={booking.teacher.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-50"
                />

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-gray-900">{booking.teacher.name}</h3>
                  <p className="text-blue-600 font-medium">{booking.teacher.subject} Teacher</p>
                  <p className="text-sm text-gray-400 mt-1">Paid: ₦{booking.amount.toLocaleString()}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition">
                    <MessageSquare size={18} /> Chat
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg font-bold hover:bg-green-100 transition">
                    <Video size={18} /> Join Class
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
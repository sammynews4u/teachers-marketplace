"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, DollarSign, Calendar, Edit2, 
  TrendingUp, Clock, MessageSquare, Star 
} from 'lucide-react';

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    const id = localStorage.getItem('teacherId');
    if (!id) {
      router.push('/login');
      return;
    }

    fetch('/api/teacher-dashboard', {
      method: 'POST',
      body: JSON.stringify({ teacherId: id }),
    })
    .then(res => res.json())
    .then(data => {
      setTeacher(data);
      if(data.bookings) {
        const total = data.bookings.reduce((acc: number, curr: any) => acc + curr.amount, 0);
        setEarnings(total);
      }
    });
  }, []);

  const handleUpdate = async () => {
    await fetch('/api/teacher-dashboard', {
      method: 'PUT',
      body: JSON.stringify(teacher),
    });
    setIsEditing(false);
    alert("Profile Updated Successfully!");
  };

  // Helper for Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (!teacher) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-blue-600 font-bold text-xl">Loading your classroom...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <p className="text-gray-500 font-medium mb-1">{getGreeting()},</p>
            <h1 className="text-4xl font-bold text-gray-900">{teacher.name} 👋</h1>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('teacherId'); router.push('/'); }}
            className="text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition"
          >
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Profile & Stats */}
          <div className="space-y-8">
            
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              
              <div className="relative mt-8 flex flex-col items-center">
                <img 
                  src={teacher.image} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4" 
                />
                
                {isEditing ? (
                  <div className="w-full space-y-3">
                    <input 
                      value={teacher.name} 
                      onChange={e => setTeacher({...teacher, name: e.target.value})} 
                      className="w-full border p-2 rounded-lg text-sm" 
                      placeholder="Name"
                    />
                    <input 
                      value={teacher.subject} 
                      onChange={e => setTeacher({...teacher, subject: e.target.value})} 
                      className="w-full border p-2 rounded-lg text-sm" 
                      placeholder="Subject"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400">₦</span>
                      <input 
                        type="number" 
                        value={teacher.hourlyRate} 
                        onChange={e => setTeacher({...teacher, hourlyRate: e.target.value})} 
                        className="w-full border p-2 pl-8 rounded-lg text-sm" 
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleUpdate} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold">Save</button>
                      <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{teacher.name}</h2>
                    <p className="text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full text-xs mt-1">{teacher.subject} Expert</p>
                    <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span>4.9 Rating</span>
                      <span>•</span>
                      <span className="font-bold text-gray-900">₦{teacher.hourlyRate}/hr</span>
                    </div>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="mt-6 flex items-center justify-center gap-2 w-full border border-gray-200 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
                    >
                      <Edit2 size={16} /> Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center text-green-600 mb-3">
                  <DollarSign size={20} />
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">₦{earnings.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 mb-3">
                  <Users size={20} />
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase">Students</p>
                <p className="text-2xl font-bold text-gray-900">{teacher.bookings?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Classroom & Students */}
          <div className="lg:col-span-2 space-y-8">

            {/* Upcoming Class (Placeholder for liveliness) */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Upcoming Session</p>
                <h3 className="text-2xl font-bold mb-2">English Conversation 101</h3>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1"><Clock size={16} /> 04:00 PM Today</span>
                  <span className="flex items-center gap-1"><Users size={16} /> 3 Students</span>
                </div>
              </div>
              <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg">
                Start Class
              </button>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  My Classroom
                </h3>
                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                  {teacher.bookings?.length} Enrolled
                </span>
              </div>
              
              {teacher.bookings?.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-gray-300" size={32} />
                  </div>
                  <p className="text-gray-500">No students have enrolled yet.</p>
                  <p className="text-sm text-blue-500 mt-2">Share your profile to get started!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {teacher.bookings.map((booking: any) => (
                    <div key={booking.id} className="p-4 hover:bg-gray-50 transition flex items-center gap-4">
                      {/* Auto-generate avatar based on name */}
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.student?.name || booking.email}`} 
                        alt="Student" 
                        className="w-12 h-12 rounded-full bg-gray-100"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">
                          {booking.student?.name || "Student"}
                        </h4>
                        <p className="text-sm text-gray-500">{booking.student?.email}</p>
                      </div>

                      <div className="hidden sm:block text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold">Joined</p>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Message">
                        <MessageSquare size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
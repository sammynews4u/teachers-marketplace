"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Camera, Edit2, Video, MessageSquare, Award, Zap } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const id = localStorage.getItem('studentId');
    if (!id) { router.push('/student-login'); return; }

    fetch('/api/student-dashboard', { method: 'POST', body: JSON.stringify({ studentId: id }), headers: { 'Content-Type': 'application/json' } })
    .then(res => res.json())
    .then(data => {
      setStudent(data);
      if(data.bookings) {
        setTotalSpent(data.bookings.reduce((acc: number, curr: any) => acc + curr.amount, 0));
      }
    });
  }, []);

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setStudent({ ...student, image: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    await fetch('/api/student-dashboard', { method: 'PUT', body: JSON.stringify({ id: student.id, name: student.name, image: student.image }), headers: { 'Content-Type': 'application/json' } });
    setIsEditing(false); alert("Profile Updated!");
  };

  if (!student) return <div className="p-10 text-center text-blue-600 font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div><h1 className="text-4xl font-bold">{student.name} 🎓</h1></div>
          <button onClick={() => { localStorage.removeItem('studentId'); router.push('/'); }} className="text-red-500 font-bold">Log Out</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
              <img src={student.image || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-white shadow-lg mb-4"/>
              {isEditing ? (
                <div className="space-y-3"><input aria-label="Name" value={student.name} onChange={e => setStudent({...student, name: e.target.value})} className="border p-2 rounded w-full"/><button onClick={handleUpdate} className="bg-green-600 text-white w-full py-2 rounded">Save</button></div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mx-auto"><Edit2 size={14} /> Edit</button>
              )}
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border"><h3 className="font-bold mb-4 flex gap-2"><Zap className="text-yellow-500"/> Progress</h3><div className="flex justify-between p-3 bg-gray-50 rounded"><span className="text-sm">Teachers</span><span className="font-bold">{student.bookings?.length || 0}</span></div><div className="flex justify-between p-3 bg-gray-50 rounded mt-2"><span className="text-sm">Invested</span><span className="font-bold">₦{totalSpent.toLocaleString()}</span></div></div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold">My Instructors</h3>
            {(!student.bookings || student.bookings.length === 0) ? <p className="text-gray-500">No teachers yet.</p> : (
              <div className="space-y-4">
                {student.bookings.map((booking: any) => (
                  <div key={booking.id} className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col sm:flex-row items-center gap-5">
                    <img src={booking.teacher.image} className="w-16 h-16 rounded-full object-cover border-2" />
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-lg font-bold">{booking.teacher.name}</h4>
                      <p className="text-blue-600 text-sm">{booking.teacher.subject}</p>
                      {booking.course && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mt-1 inline-block">Course: {booking.course.title}</span>}
                    </div>
                    
                    <div className="flex gap-2">
                      <button aria-label="Chat" className="p-3 bg-gray-50 text-gray-600 rounded-xl"><MessageSquare size={20} /></button>
                      
                      {/* JOIN GOOGLE CLASSROOM BUTTON */}
                      {booking.course?.classroomUrl ? (
                        <a href={booking.course.classroomUrl} target="_blank" className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">
                          <Video size={20} /> Join Class
                        </a>
                      ) : (
                        <button className="flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold">
                          <Video size={20} /> Join Session
                        </button>
                      )}
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
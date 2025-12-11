"use client";

import Navbar from '../../components/Navbar';
import ChatWindow from '../../components/ChatWindow';
import UploadButton from '../../components/UploadButton';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Edit2, Video, MessageSquare, Award, Zap, Star 
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  
  // TABS STATE
  const [activeTab, setActiveTab] = useState('instructors'); 

  // REVIEW STATE
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<any>(null); 
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('studentId');
    if (!id) { router.push('/student-login'); return; }

    fetch('/api/student-dashboard', {
      method: 'POST',
      body: JSON.stringify({ studentId: id }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      setStudent(data);
      if(data.bookings) {
        const total = data.bookings.reduce((acc: number, curr: any) => acc + curr.amount, 0);
        setTotalSpent(total);
      }
    });
  }, []);

  // --- HANDLERS ---
  
  const handleStartChat = async (teacherId: string) => {
    if (!confirm("Start a chat with this instructor?")) return;
    
    await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        senderId: student.id,
        senderType: 'student',
        receiverId: teacherId,
        content: "Hi! I just joined your class."
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    setActiveTab('messages');
  };

  const handleUpdate = async () => {
    await fetch('/api/student-dashboard', {
      method: 'PUT',
      body: JSON.stringify({ id: student.id, name: student.name, image: student.image }),
      headers: { 'Content-Type': 'application/json' }
    });
    setIsEditing(false);
    alert("Profile Updated!");
  };

  const submitReview = async () => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        studentId: student.id,
        teacherId: reviewTarget,
        rating,
        comment
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if(res.ok) {
        alert("Review Submitted! Thank you.");
        setShowReviewModal(false);
        setComment('');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  };

  if (!student) return <div className="p-20 text-center text-blue-600 font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />

      {/* --- REVIEW MODAL --- */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center animate-in zoom-in-95">
            <h3 className="font-bold text-xl mb-4">Rate this Teacher</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setRating(star)} className={`transition ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                  <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <textarea 
              placeholder="Write your experience..." 
              className="w-full border p-3 rounded-xl mb-4 h-24"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={submitReview} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold">Submit</button>
              <button onClick={() => setShowReviewModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div><p className="text-gray-500 font-medium">{getGreeting()},</p><h1 className="text-4xl font-bold text-gray-900">{student.name} 🎓</h1></div>
          <button onClick={() => { localStorage.removeItem('studentId'); router.push('/'); }} className="text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition">Log Out</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Profile & Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
              <div className="relative mt-10">
                <img src={student.image || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} className="w-28 h-28 mx-auto mb-4 rounded-full object-cover border-4 border-white shadow-lg bg-white" />
                
                {isEditing ? (
                  <div className="space-y-3 px-4">
                    <div className="flex justify-center">
                        <UploadButton onUpload={(url) => setStudent({...student, image: url})} />
                    </div>
                    <input value={student.name} onChange={e => setStudent({...student, name: e.target.value})} className="w-full border p-2 rounded-lg text-center font-bold"/>
                    <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold w-full">Save</button>
                  </div>
                ) : (
                  <><h2 className="text-xl font-bold">{student.name}</h2><p className="text-gray-500 text-sm mb-4">{student.email}</p><button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition"><Edit2 size={14} /> Edit Profile</button></>
                )}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Zap className="text-yellow-500" size={20} /> Your Progress</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3"><div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><BookOpen size={18} /></div><span className="text-sm font-medium">Teachers Hired</span></div>
                        <span className="font-bold text-lg">{student.bookings?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3"><div className="bg-green-100 text-green-600 p-2 rounded-lg"><Award size={18} /></div><span className="text-sm font-medium">Invested</span></div>
                        <span className="font-bold text-lg">${totalSpent.toLocaleString()}</span>
                    </div>
                </div>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TABS */}
            <div className="flex gap-4 mb-4 bg-gray-200 p-1 rounded-2xl w-fit">
              <button onClick={() => setActiveTab('instructors')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'instructors' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>My Instructors</button>
              <button onClick={() => setActiveTab('messages')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'messages' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Messages</button>
            </div>

            {/* TAB 1: INSTRUCTORS */}
            {activeTab === 'instructors' && (
              <>
                <div className="bg-gray-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"><div className="relative z-10"><h3 className="text-2xl font-bold mb-2">Ready to learn?</h3><p className="text-gray-400 mb-6">You have access to expert teachers. Start a class now.</p><button onClick={() => router.push('/teachers')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-600/30">Find More Teachers</button></div><div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-gray-800 rounded-full opacity-50"></div></div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">My Instructors</h3>
                  {(!student.bookings || student.bookings.length === 0) ? (
                    <div className="bg-white p-10 text-center rounded-2xl border border-dashed border-gray-300"><p className="text-gray-500">You haven't hired anyone yet.</p></div>
                  ) : (
                    <div className="space-y-4">
                      {student.bookings.map((booking: any) => (
                        <div key={booking.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col sm:flex-row items-center gap-5">
                          <img src={booking.teacher.image} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                          <div className="flex-1 text-center sm:text-left"><h4 className="text-lg font-bold text-gray-900">{booking.teacher.name}</h4><p className="text-blue-600 text-sm font-medium">{booking.teacher.subject}</p><p className="text-xs text-gray-400 mt-1">Hired on {new Date(booking.createdAt).toLocaleDateString()}</p></div>
                          <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition"><Video size={18} /> Join Class</button>
                            <button onClick={() => { setReviewTarget(booking.teacher.id); setShowReviewModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl font-bold hover:bg-yellow-100 transition"><Star size={18} /> Rate</button>
                            <button onClick={() => handleStartChat(booking.teacher.id)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition"><MessageSquare size={18} /> Chat</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: MESSAGES */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 h-[600px]">
                <ChatWindow myId={student.id} myType="student" />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
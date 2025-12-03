"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, DollarSign, Calendar, Edit2, 
  Clock, MessageSquare, Star, Video, Plus, Trash2, 
  CheckCircle2, ShieldCheck, ArrowRight 
} from 'lucide-react';

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('classroom');
  const [earnings, setEarnings] = useState(0);

  // ONBOARDING STATE
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', price: '', startDate: '', endDate: '', schedule: ''
  });
  const [showCourseForm, setShowCourseForm] = useState(false);

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
      
      // TRIGGER ONBOARDING if false
      if (data.hasOnboarded === false) {
        setShowOnboarding(true);
      }

      if(data.bookings) {
        const total = data.bookings.reduce((acc: number, curr: any) => {
          return curr.type === 'trial' ? acc : acc + curr.amount;
        }, 0);
        setEarnings(total);
      }
    });

    fetch(`/api/courses?teacherId=${id}`)
      .then(res => res.json())
      .then(data => setCourses(data));

  }, []);

  const handleFinishOnboarding = async () => {
    // Save to DB that they finished
    await fetch('/api/teacher-dashboard', {
      method: 'PUT',
      body: JSON.stringify({ ...teacher, hasOnboarded: true }),
    });
    setShowOnboarding(false);
    alert("Welcome aboard! You are now live.");
  };

  const handleUpdate = async () => {
    await fetch('/api/teacher-dashboard', {
      method: 'PUT',
      body: JSON.stringify(teacher),
    });
    setIsEditing(false);
    alert("Profile Updated Successfully!");
  };

  // ... (Course Create/Delete functions remain the same) ...
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/courses', {
      method: 'POST',
      body: JSON.stringify({ ...newCourse, teacherId: teacher.id }),
    });
    if (res.ok) {
      alert("Course Created!");
      setShowCourseForm(false);
      fetch(`/api/courses?teacherId=${teacher.id}`).then(r => r.json()).then(setCourses);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if(!confirm("Delete this course?")) return;
    await fetch('/api/courses', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetch(`/api/courses?teacherId=${teacher.id}`).then(r => r.json()).then(setCourses);
  };
  // ... (End Course functions) ...

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  };

  if (!teacher) return <div className="p-20 text-center text-blue-600 font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />

      {/* --- ONBOARDING POPUP MODAL --- */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header Image/Color */}
            <div className="h-32 bg-blue-600 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-blue-700 opacity-50 pattern-grid-lg"></div>
              <ShieldCheck className="text-white w-16 h-16 relative z-10" />
            </div>

            <div className="p-8">
              {/* STEP 1: WELCOME */}
              {onboardingStep === 1 && (
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome, Teacher! 👋</h2>
                  <p className="text-gray-500">
                    We are thrilled to have you. Before you start teaching, let's take 30 seconds to show you how to succeed on <strong>TeachersB</strong>.
                  </p>
                  <button 
                    onClick={() => setOnboardingStep(2)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    Start Tour <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 2: HOW IT WORKS */}
              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 text-center">How to Climb the Ranks 🚀</h2>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="bg-green-100 p-3 rounded-lg h-fit"><CheckCircle2 className="text-green-600"/></div>
                      <div>
                        <h4 className="font-bold">Get Verified</h4>
                        <p className="text-sm text-gray-500">Complete your profile to get the Blue Badge. Verified teachers get 3x more students.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-orange-100 p-3 rounded-lg h-fit"><Star className="text-orange-600"/></div>
                      <div>
                        <h4 className="font-bold">Get Reviews</h4>
                        <p className="text-sm text-gray-500">Ask your students to rate you. High ratings = Top of the search results.</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setOnboardingStep(3)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* STEP 3: TERMS & CONDITIONS */}
              {onboardingStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 text-center">Terms & Conditions</h2>
                  <div className="h-40 overflow-y-auto bg-gray-50 p-4 rounded-lg text-xs text-gray-600 border">
                    <p className="mb-2"><strong>1. Professionalism:</strong> Teachers must maintain a professional standard at all times during video calls.</p>
                    <p className="mb-2"><strong>2. Payments:</strong> All payments made through the platform take 24 hours to settle in your wallet.</p>
                    <p className="mb-2"><strong>3. No-Show Policy:</strong> If you miss a scheduled class without 24hr notice, you may be penalized.</p>
                    <p><strong>4. Verification:</strong> We reserve the right to verify your identity before payouts.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <input type="checkbox" id="accept" className="w-5 h-5 text-blue-600" />
                     <label htmlFor="accept" className="text-sm text-gray-700">I have read and accept the terms.</label>
                  </div>

                  <button 
                    onClick={handleFinishOnboarding}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
                  >
                    I Agree & Get Started
                  </button>
                </div>
              )}
              
              {/* Step Dots */}
              <div className="flex justify-center gap-2 mt-6">
                <div className={`w-2 h-2 rounded-full ${onboardingStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-2 h-2 rounded-full ${onboardingStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-2 h-2 rounded-full ${onboardingStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              </div>

            </div>
          </div>
        </div>
      )}

      
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* HEADER */}
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
          
          {/* LEFT: Profile & Stats */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-600 to-purple-600"></div>
               <img src={teacher.image} className="relative w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-4 mt-8" />
               
               {isEditing ? (
                  <div className="space-y-3">
                    <input value={teacher.name} onChange={e => setTeacher({...teacher, name: e.target.value})} className="border p-2 w-full rounded text-sm"/>
                    <input value={teacher.subject} onChange={e => setTeacher({...teacher, subject: e.target.value})} className="border p-2 w-full rounded text-sm"/>
                    <input type="number" value={teacher.hourlyRate} onChange={e => setTeacher({...teacher, hourlyRate: e.target.value})} className="border p-2 w-full rounded text-sm"/>
                    <button onClick={handleUpdate} className="bg-green-600 text-white w-full py-2 rounded font-bold text-sm">Save Changes</button>
                  </div>
               ) : (
                  <>
                    <h2 className="text-xl font-bold flex items-center justify-center gap-1">
                      {teacher.name} 
                      {teacher.isVerified && <CheckCircle2 size={16} className="text-blue-500" />}
                    </h2>
                    <p className="text-blue-600 font-medium text-sm">{teacher.subject}</p>
                    <p className="font-bold mt-2">₦{teacher.hourlyRate}/hr (Base)</p>
                    <button onClick={() => setIsEditing(true)} className="text-sm text-gray-400 mt-4 underline hover:text-blue-600">Edit Profile</button>
                  </>
               )}
            </div>
            
            {/* RANKING CARD */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-2">
                 <p className="text-gray-500 text-xs font-bold uppercase">Your Rank</p>
                 <ShieldCheck size={16} className="text-purple-500" />
               </div>
               <p className="text-2xl font-bold text-purple-600">
                 {teacher.isVerified ? 'Top Teacher 🌟' : 'Newcomer'}
               </p>
               <p className="text-xs text-gray-400 mt-1">Verify your profile to climb higher.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-xs font-bold uppercase">Total Earnings</p>
               <p className="text-2xl font-bold text-green-600">₦{earnings.toLocaleString()}</p>
            </div>
          </div>

          {/* RIGHT: Content Area */}
          <div className="lg:col-span-2">
            {/* TABS */}
            <div className="flex gap-4 mb-6 bg-gray-200 p-1 rounded-full w-fit">
              <button onClick={() => setActiveTab('classroom')} className={`px-6 py-2 rounded-full font-bold transition text-sm ${activeTab === 'classroom' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Classroom</button>
              <button onClick={() => setActiveTab('courses')} className={`px-6 py-2 rounded-full font-bold transition text-sm ${activeTab === 'courses' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>My Courses</button>
            </div>

            {/* TAB 1: CLASSROOM */}
            {activeTab === 'classroom' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in">
                 <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={20}/> Students Enrolled</h3>
                 {teacher.bookings?.length === 0 ? <p className="text-gray-400 py-10 text-center">No students yet.</p> : (
                   <div className="divide-y">
                     {teacher.bookings.map((b: any) => (
                       <div key={b.id} className="py-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${b.student?.name}`} className="w-10 h-10 rounded-full bg-gray-100"/>
                           <div>
                             <p className="font-bold text-gray-900">{b.student?.name}</p>
                             <div className="flex gap-2">
                                <span className="text-xs text-gray-500">{b.type === 'trial' ? 'Free Trial' : 'Paid Student'}</span>
                             </div>
                           </div>
                         </div>
                         <button className="text-blue-600 bg-blue-50 p-2 rounded-lg"><MessageSquare size={18}/></button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {/* TAB 2: COURSES */}
            {activeTab === 'courses' && (
              <div className="space-y-6 animate-in fade-in">
                {!showCourseForm && (
                    <button onClick={() => setShowCourseForm(true)} className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition flex justify-center items-center gap-2">
                    <Plus size={20} /> Create New Cohort / Course
                    </button>
                )}
                {showCourseForm && (
                  <form onSubmit={handleCreateCourse} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-4 relative">
                    <button type="button" onClick={() => setShowCourseForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold">Cancel</button>
                    <h3 className="font-bold text-lg text-gray-900">New Course Details</h3>
                    <input required placeholder="Course Title" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                    <textarea required placeholder="Description" className="w-full border p-3 rounded-lg h-24" onChange={e => setNewCourse({...newCourse, description: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input required type="number" placeholder="Price (₦)" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, price: e.target.value})} />
                      <input required type="text" placeholder="Schedule" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, schedule: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs text-gray-500 mb-1 block">Start Date</label><input required type="date" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, startDate: e.target.value})} /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">End Date</label><input required type="date" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, endDate: e.target.value})} /></div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Publish Course</button>
                  </form>
                )}
                <div className="grid gap-4">
                  {courses.map(course => (
                    <div key={course.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{course.title}</h4>
                        <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-400">
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Calendar size={12}/> {new Date(course.startDate).toLocaleDateString()}</span>
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded">₦{course.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCourse(course.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
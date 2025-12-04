"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Users, DollarSign, Calendar, Edit2, 
  Clock, MessageSquare, Star, Video, Plus, Trash2, 
  CheckCircle2, ShieldCheck, ArrowRight, Crown, Rocket 
} from 'lucide-react';

// Dynamic Import for Paystack to prevent server-side errors
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

export default function TeacherDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [teacher, setTeacher] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('classroom'); 
  const [earnings, setEarnings] = useState(0);

  // ONBOARDING STATE
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // NEW COURSE FORM STATE
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', price: '', startDate: '', endDate: '', schedule: ''
  });
  const [showCourseForm, setShowCourseForm] = useState(false);

  // PAYSTACK KEY
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_1a823085e1393c55ce245b02feb6a316e6c6ad49';

  useEffect(() => {
    setMounted(true);

    const id = localStorage.getItem('teacherId');
    if (!id) {
      router.push('/login');
      return;
    }

    // 1. Fetch Teacher Data with Safety Checks
    fetch('/api/teacher-dashboard', {
      method: 'POST',
      body: JSON.stringify({ teacherId: id }),
    })
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(data => {
      if (!data) {
        throw new Error("No data returned");
      }
      
      setTeacher(data);
      
      // Trigger Onboarding
      if (data.hasOnboarded === false) {
        setShowOnboarding(true);
      }

      // Calculate Earnings
      if (data.bookings && Array.isArray(data.bookings)) {
        const total = data.bookings.reduce((acc: number, curr: any) => {
          return curr.type === 'trial' ? acc : acc + curr.amount;
        }, 0);
        setEarnings(total);
      }
    })
    .catch(err => {
      console.error("Dashboard Load Error:", err);
      // Only redirect if it's a critical auth failure
      if (!teacher) router.push('/login');
    });

    // 2. Fetch Courses
    fetch(`/api/courses?teacherId=${id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch(err => console.error("Courses Error:", err));

  }, []);

  // --- HANDLERS ---

  const handleFinishOnboarding = async () => {
    if (!teacher) return;
    await fetch('/api/teacher-dashboard', {
      method: 'PUT',
      body: JSON.stringify({ ...teacher, hasOnboarded: true }),
    });
    setShowOnboarding(false);
    alert("Welcome aboard! You are now live.");
  };

  const handleUpdateProfile = async () => {
    if (!teacher) return;
    await fetch('/api/teacher-dashboard', {
      method: 'PUT',
      body: JSON.stringify(teacher),
    });
    setIsEditing(false);
    alert("Profile Updated Successfully!");
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    
    const res = await fetch('/api/courses', {
      method: 'POST',
      body: JSON.stringify({ ...newCourse, teacherId: teacher.id }),
    });

    if (res.ok) {
      alert("Course Created Successfully!");
      setShowCourseForm(false);
      fetch(`/api/courses?teacherId=${teacher.id}`).then(r => r.json()).then(setCourses);
    } else {
      alert("Failed to create course.");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if(!confirm("Are you sure you want to delete this course?")) return;
    await fetch('/api/courses', { method: 'DELETE', body: JSON.stringify({ id }) });
    if(teacher) fetch(`/api/courses?teacherId=${teacher.id}`).then(r => r.json()).then(setCourses);
  };

  const handlePackageSuccess = async (reference: any, plan: string, amount: number) => {
    if (!teacher) return;
    
    const res = await fetch('/api/packages/purchase', {
      method: 'POST',
      body: JSON.stringify({
        teacherId: teacher.id,
        plan,
        amount,
        reference: reference.reference
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      alert(`Success! You are now on the ${plan.toUpperCase()} Plan.`);
      window.location.reload(); 
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  if (!teacher) return <div className="p-20 text-center text-blue-600 font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />

      {/* --- ONBOARDING MODAL --- */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="h-32 bg-blue-600 flex items-center justify-center relative">
              <ShieldCheck className="text-white w-16 h-16 relative z-10" />
            </div>
            <div className="p-8">
              {onboardingStep === 1 && (
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome, Teacher! 👋</h2>
                  <p className="text-gray-500">Let's get you set up for success on TeachersB.</p>
                  <button onClick={() => setOnboardingStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">Start Tour <ArrowRight size={18} /></button>
                </div>
              )}
              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center">How to Succeed 🚀</h2>
                  <div className="space-y-4">
                    <div className="flex gap-4"><div className="bg-green-100 p-3 rounded-lg"><CheckCircle2 className="text-green-600"/></div><div><h4 className="font-bold">Get Verified</h4><p className="text-sm text-gray-500">Verified teachers get 3x more students.</p></div></div>
                    <div className="flex gap-4"><div className="bg-orange-100 p-3 rounded-lg"><Star className="text-orange-600"/></div><div><h4 className="font-bold">Collect Reviews</h4><p className="text-sm text-gray-500">Ask students to rate you after class.</p></div></div>
                  </div>
                  <button onClick={() => setOnboardingStep(3)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Next</button>
                </div>
              )}
              {onboardingStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-center">Terms & Conditions</h2>
                  <div className="h-32 overflow-y-auto bg-gray-50 p-4 rounded text-xs text-gray-600 border"><p>1. Be professional.<br/>2. No-shows are penalized.<br/>3. Payments settle in 24hrs.</p></div>
                  <button onClick={handleFinishOnboarding} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">I Agree & Get Started</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-gray-500 font-medium">{getGreeting()},</p>
              {/* PLAN BADGES */}
              {teacher.plan === 'gold' && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-300 flex items-center gap-1"><Crown size={12}/> GOLD MEMBER</span>}
              {teacher.plan === 'silver' && <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-gray-300 flex items-center gap-1"><ShieldCheck size={12}/> SILVER MEMBER</span>}
            </div>
            <h1 className="text-4xl font-bold text-gray-900">{teacher.name} 👋</h1>
          </div>
          <button onClick={() => { localStorage.removeItem('teacherId'); router.push('/'); }} className="text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition">Log Out</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Profile & Stats */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-20 bg-gradient-to-r ${teacher.plan === 'gold' ? 'from-yellow-400 to-orange-500' : 'from-blue-600 to-purple-600'}`}></div>
               <img src={teacher.image} alt={teacher.name} className="relative w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-4 mt-8" />
               
               {isEditing ? (
                  <div className="space-y-3">
                    <input aria-label="Name" value={teacher.name} onChange={e => setTeacher({...teacher, name: e.target.value})} className="border p-2 w-full rounded text-sm"/>
                    <input aria-label="Subject" value={teacher.subject} onChange={e => setTeacher({...teacher, subject: e.target.value})} className="border p-2 w-full rounded text-sm"/>
                    <input aria-label="Hourly Rate" type="number" value={teacher.hourlyRate} onChange={e => setTeacher({...teacher, hourlyRate: e.target.value})} className="border p-2 w-full rounded text-sm"/>
                    <button onClick={handleUpdateProfile} className="bg-green-600 text-white w-full py-2 rounded font-bold text-sm">Save Changes</button>
                  </div>
               ) : (
                  <>
                    <h2 className="text-xl font-bold">{teacher.name}</h2>
                    <p className="text-blue-600 font-medium text-sm">{teacher.subject}</p>
                    <p className="font-bold mt-2">₦{teacher.hourlyRate}/hr</p>
                    <button onClick={() => setIsEditing(true)} className="text-sm text-gray-400 mt-4 underline hover:text-blue-600">Edit Profile</button>
                  </>
               )}
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-xs font-bold uppercase">Total Earnings</p>
               <p className="text-2xl font-bold text-green-600">₦{earnings.toLocaleString()}</p>
            </div>
          </div>

          {/* RIGHT: Content Area */}
          <div className="lg:col-span-2">
            
            {/* TABS */}
            <div className="flex flex-wrap gap-4 mb-6 bg-gray-200 p-1 rounded-2xl w-fit">
              <button onClick={() => setActiveTab('classroom')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'classroom' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Classroom</button>
              <button onClick={() => setActiveTab('courses')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'courses' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>My Courses</button>
              <button onClick={() => setActiveTab('boost')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'boost' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>🚀 Boost Profile</button>
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
                           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${b.student?.name}`} alt="student avatar" className="w-10 h-10 rounded-full bg-gray-100"/>
                           <div>
                             <p className="font-bold text-gray-900">{b.student?.name}</p>
                             <div className="flex gap-2">
                                <span className="text-xs text-gray-500">{b.type === 'trial' ? 'Free Trial' : 'Paid Student'}</span>
                                {b.scheduledAt && <span className="text-xs text-orange-500 font-bold">Scheduled: {new Date(b.scheduledAt).toLocaleDateString()}</span>}
                             </div>
                           </div>
                         </div>
                         <button aria-label="Message Student" className="text-blue-600 bg-blue-50 p-2 rounded-lg"><MessageSquare size={18}/></button>
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
                    <input aria-label="Course Title" required placeholder="Course Title" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                    <textarea aria-label="Description" required placeholder="Description" className="w-full border p-3 rounded-lg h-24" onChange={e => setNewCourse({...newCourse, description: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input aria-label="Price" required type="number" placeholder="Price (₦)" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, price: e.target.value})} />
                      <input aria-label="Schedule" required type="text" placeholder="Schedule" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, schedule: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs text-gray-500 mb-1 block">Start Date</label><input aria-label="Start Date" required type="date" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, startDate: e.target.value})} /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">End Date</label><input aria-label="End Date" required type="date" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, endDate: e.target.value})} /></div>
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
                      <button aria-label="Delete Course" onClick={() => handleDeleteCourse(course.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: BOOST PROFILE */}
            {activeTab === 'boost' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-lg text-blue-900">Why Boost?</h3>
                  <p className="text-blue-700 text-sm">Boosted profiles appear at the top of search results. Get 5x more students.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* BRONZE */}
                  <div className="bg-white border-2 border-orange-100 rounded-2xl p-6 hover:shadow-lg transition">
                    <h4 className="text-orange-800 font-bold uppercase text-sm tracking-wider mb-2">Bronze Plan</h4>
                    <p className="text-3xl font-bold text-gray-900 mb-4">₦10k</p>
                    {/* @ts-ignore */}
                    <PaystackButton 
                      email={teacher.email}
                      amount={10000 * 100}
                      publicKey={publicKey}
                      text="Buy Bronze"
                      onSuccess={(ref: any) => handlePackageSuccess(ref, 'bronze', 10000)}
                      className="w-full bg-orange-100 text-orange-700 font-bold py-3 rounded-lg hover:bg-orange-200 transition"
                    />
                  </div>
                  {/* SILVER */}
                  <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 hover:shadow-lg transition">
                    <h4 className="text-gray-600 font-bold uppercase text-sm tracking-wider mb-2">Silver Plan</h4>
                    <p className="text-3xl font-bold text-gray-900 mb-4">₦20k</p>
                    {/* @ts-ignore */}
                    <PaystackButton 
                      email={teacher.email}
                      amount={20000 * 100}
                      publicKey={publicKey}
                      text="Buy Silver"
                      onSuccess={(ref: any) => handlePackageSuccess(ref, 'silver', 20000)}
                      className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition"
                    />
                  </div>
                  {/* GOLD */}
                  <div className="bg-white border-2 border-yellow-400 rounded-2xl p-6 relative shadow-lg transform scale-105">
                    <div className="absolute top-0 inset-x-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 text-center uppercase tracking-widest">Best Value</div>
                    <h4 className="text-yellow-600 font-bold uppercase text-sm tracking-wider mb-2 mt-4">Gold Plan</h4>
                    <p className="text-3xl font-bold text-gray-900 mb-4">₦30k</p>
                    {/* @ts-ignore */}
                    <PaystackButton 
                      email={teacher.email}
                      amount={30000 * 100}
                      publicKey={publicKey}
                      text="Buy Gold"
                      onSuccess={(ref: any) => handlePackageSuccess(ref, 'gold', 30000)}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
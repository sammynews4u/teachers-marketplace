"use client";

import Navbar from '../../components/Navbar';
import ChatWindow from '../../components/ChatWindow'; 
import UploadButton from '../../components/UploadButton'; 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackConversion } from '../../lib/analytics';
import { 
  Users, DollarSign, Calendar, Edit2, FileText,
  Clock, MessageSquare, Star, Video, Plus, Trash2, 
  CheckCircle2, ShieldCheck, ArrowRight, Crown, Rocket, Zap, Megaphone, Wallet, BadgeCheck, Loader2
} from 'lucide-react';

export default function TeacherDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [teacher, setTeacher] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]); // Store Admin Packages
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('classroom'); 
  const [earnings, setEarnings] = useState(0);

  // WALLET STATE
  const [wallet, setWallet] = useState<any>({ availableBalance: 0, payouts: [], totalEarnings: 0 });
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountName: '', amount: '' });

  // ONBOARDING
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // COURSE FORM
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', price: '', startDate: '', endDate: '', schedule: '', classroomUrl: '', image: ''
  });
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [processingPackage, setProcessingPackage] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = localStorage.getItem('teacherId');
    if (!id) { router.push('/login'); return; }

    // 1. Fetch Teacher Data
    fetch('/api/teacher-dashboard', { method: 'POST', body: JSON.stringify({ teacherId: id }) })
    .then(res => res.json())
    .then(data => {
      setTeacher(data);
      if (data.hasOnboarded === false) setShowOnboarding(true);
      if (data.bookings) {
        const total = data.bookings.reduce((acc: number, curr: any) => curr.type === 'trial' ? acc : acc + curr.amount, 0);
        setEarnings(total);
      }
    });

    // 2. Fetch Courses
    fetch(`/api/courses?teacherId=${id}`).then(res => res.json()).then(data => setCourses(data));

    // 3. Fetch Wallet
    fetch('/api/payouts', { method: 'POST', body: JSON.stringify({ teacherId: id }) })
      .then(res => res.json())
      .then(data => setWallet(data));
    
    // 4. Fetch Admin Packages
    fetch('/api/public/packages')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setPackages(data); });

  }, []);

  // --- HANDLERS ---

  const handleStartChat = async (studentId: string) => {
    if (!confirm("Start a conversation with this student?")) return;
    await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ senderId: teacher.id, senderType: 'teacher', receiverId: studentId, content: "Hello! Welcome to my class." }),
      headers: { 'Content-Type': 'application/json' }
    });
    setActiveTab('messages');
  };

  const handleFinishOnboarding = async () => {
    if (!teacher) return;
    await fetch('/api/teacher-dashboard', { method: 'PUT', body: JSON.stringify({ ...teacher, hasOnboarded: true }) });
    setShowOnboarding(false);
    setActiveTab('boost'); 
    alert("Welcome! Please select a visibility plan.");
  };

  const handleUpdateProfile = async () => {
    await fetch('/api/teacher-dashboard', { method: 'PUT', body: JSON.stringify(teacher) });
    setIsEditing(false); alert("Profile Updated!");
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newCourse.image) return alert("Please upload a cover image.");
    const res = await fetch('/api/courses', { method: 'POST', body: JSON.stringify({ ...newCourse, teacherId: teacher.id }) });
    if (res.ok) {
      alert("Course Created! Redirecting to Builder...");
      const saved = await res.json();
      router.push(`/teacher/course-editor/${saved.id}`);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if(!confirm("Delete this course?")) return;
    await fetch('/api/courses', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetch(`/api/courses?teacherId=${teacher.id}`).then(r => r.json()).then(setCourses);
  };

  const handleWithdraw = async () => {
    if(parseInt(bankForm.amount) > wallet.availableBalance) return alert("Insufficient funds");
    if(!bankForm.bankName || !bankForm.accountNumber) return alert("Please fill bank details");
    await fetch('/api/payouts', { method: 'PUT', body: JSON.stringify({ teacherId: teacher.id, ...bankForm }) });
    alert("Withdrawal Request Sent!");
    window.location.reload();
  };

  const handleUploadVerification = async (url: string) => {
    const res = await fetch('/api/teacher-dashboard', {
        method: 'PUT',
        body: JSON.stringify({ id: teacher.id, verificationDocs: url }),
        headers: { 'Content-Type': 'application/json' }
    });
    if(res.ok) {
        alert("Document Submitted! Verification pending.");
        window.location.reload();
    }
  };

  // --- NEW: AccountPe Payment Handler for Packages ---
  const handleBuyPackage = async (planName: string, price: number) => {
    setProcessingPackage(true);
    try {
      const res = await fetch('/api/packages/purchase', {
        method: 'POST', 
        body: JSON.stringify({ 
            teacherId: teacher.id, 
            plan: planName.toLowerCase(), 
            amount: price,
            reference: `PKG-${Date.now()}` // Generate local ref before gateway
        }), 
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();

      if (data.success && data.paymentUrl) {
         trackConversion('AddToCart', price);
         // Redirect to AccountPe Payment Page
         window.location.href = data.paymentUrl; 
      } else {
         alert(`Payment Failed: ${data.error || "Unknown error"}`);
         setProcessingPackage(false);
      }
    } catch(e) { 
        alert("Network Error: Could not connect to server.");
        setProcessingPackage(false);
    }
  };

  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening"; };
  
  const getPackageStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('gold')) return 'border-yellow-400 bg-yellow-50';
    if (lower.includes('silver')) return 'border-gray-300 bg-gray-50';
    return 'border-orange-200 bg-orange-50';
  };
  const getButtonStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('gold')) return 'bg-yellow-500 text-white hover:bg-yellow-600';
    if (lower.includes('silver')) return 'bg-gray-700 text-white hover:bg-gray-800';
    return 'bg-orange-500 text-white hover:bg-orange-600';
  };

  if (!mounted) return null;
  if (!teacher) return <div className="p-20 text-center text-blue-600 font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative pt-16"> 
      <Navbar />

      {teacher.plan === 'free' && (<div onClick={() => setActiveTab('boost')} className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 text-center cursor-pointer hover:opacity-90 transition shadow-md group"><p className="font-bold text-sm flex items-center justify-center gap-2 animate-pulse"><Megaphone size={20} /> UPGRADE TO GET MORE STUDENTS! <span className="underline">Boost Now</span><ArrowRight size={18} /></p></div>)}
      
      {showOnboarding && (<div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300"><div className="h-32 bg-blue-600 flex items-center justify-center"><ShieldCheck className="text-white w-16 h-16" /></div><div className="p-8">{onboardingStep === 1 && (<div className="text-center space-y-4"><h2 className="text-2xl font-bold">Welcome Teacher! 👋</h2><p className="text-gray-500">Let's set you up.</p><button onClick={() => setOnboardingStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Start Tour</button></div>)}{onboardingStep === 2 && (<div className="space-y-6"><h2 className="text-2xl font-bold text-center">Success Tips 🚀</h2><div className="space-y-4"><div className="flex gap-4"><div className="bg-green-100 p-3 rounded"><CheckCircle2 className="text-green-600"/></div><div><h4 className="font-bold">Get Verified</h4><p className="text-sm text-gray-500">Verified tutors get 3x more students.</p></div></div></div><button onClick={() => setOnboardingStep(3)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Next</button></div>)}{onboardingStep === 3 && (<div className="space-y-4"><h2 className="text-2xl font-bold text-center">Terms</h2><div className="h-32 overflow-y-auto bg-gray-50 p-4 text-xs border"><p>1. Be professional.<br/>2. No-shows penalized.</p></div><button onClick={handleFinishOnboarding} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">I Agree & View Plans</button></div>)}</div></div></div>)}
      
      <div className="pt-8 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-gray-500 font-medium">{getGreeting()},</p>
              {teacher.plan !== 'free' && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-300 flex items-center gap-1"><Crown size={12}/> {teacher.plan.toUpperCase()}</span>}
            </div>
            <h1 className="text-4xl font-bold text-gray-900">{teacher.name} 👋</h1>
          </div>
          <button onClick={() => { localStorage.removeItem('teacherId'); router.push('/'); }} className="text-red-500 font-medium">Log Out</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: PROFILE & EARNINGS */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border text-center relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-20 bg-gradient-to-r ${teacher.plan.includes('gold') ? 'from-yellow-400 to-orange-500' : 'from-blue-600 to-purple-600'}`}></div>
               <img src={teacher.image || "https://via.placeholder.com/150"} className="relative w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-4 mt-8"/>
               {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex justify-center"><UploadButton onUpload={(url) => setTeacher({...teacher, image: url})} /></div>
                    <input aria-label="Name" value={teacher.name} onChange={e => setTeacher({...teacher, name: e.target.value})} className="border p-2 w-full rounded text-sm"/>
                    <input aria-label="Subject" value={teacher.subject} onChange={e => setTeacher({...teacher, subject: e.target.value})} className="border p-2 w-full rounded text-sm"/>
                    <input aria-label="Rate" type="number" value={teacher.hourlyRate} onChange={e => setTeacher({...teacher, hourlyRate: e.target.value})} className="border p-2 w-full rounded text-sm"/>
                    <button onClick={handleUpdateProfile} className="bg-green-600 text-white w-full py-2 rounded font-bold text-sm">Save</button>
                  </div>
               ) : (
                  <>
                    <h2 className="text-xl font-bold flex items-center justify-center gap-1">
                        {teacher.name}
                        {teacher.isVerified && <BadgeCheck className="text-blue-500" size={20} />}
                    </h2>
                    <p className="text-blue-600 font-medium text-sm">{teacher.subject}</p>
                    <p className="font-bold mt-2">${teacher.hourlyRate}/hr</p>
                    <button onClick={() => setIsEditing(true)} className="text-sm text-gray-400 mt-4 underline">Edit Profile</button>
                  </>
               )}
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border"><p className="text-gray-500 text-xs font-bold uppercase">Earnings</p><p className="text-2xl font-bold text-green-600">${earnings.toLocaleString()}</p></div>
          </div>

          <div className="lg:col-span-2">
            
            <div className="flex flex-wrap gap-4 mb-6 bg-gray-200 p-1 rounded-2xl w-fit">
              {['classroom', 'courses', 'messages', 'wallet', 'verification', 'boost'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl font-bold capitalize transition text-sm ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>{tab}</button>
              ))}
            </div>

            {/* CLASSROOM */}
            {activeTab === 'classroom' && (<div className="bg-white rounded-2xl shadow-sm border p-6"><h3 className="font-bold text-lg mb-4">Students Enrolled</h3>{teacher.bookings?.length === 0 ? <p className="text-gray-400">No students yet.</p> : (<div className="divide-y">{teacher.bookings.map((b: any) => (<div key={b.id} className="py-4 flex justify-between items-center"><div className="flex gap-3 items-center"><img src={b.student?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${b.student?.name}`} className="w-10 h-10 rounded-full"/><div><p className="font-bold">{b.student?.name}</p><p className="text-xs text-gray-500">{b.type}</p></div></div><button onClick={() => handleStartChat(b.student?.id)} aria-label="Chat" className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition"><MessageSquare size={18}/></button></div>))}</div>)}</div>)}
            
            {/* COURSES */}
            {activeTab === 'courses' && (
              <div className="space-y-6 animate-in fade-in">
                {!showCourseForm && <button onClick={() => setShowCourseForm(true)} className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 flex justify-center items-center gap-2"><Plus size={20} /> Create New Cohort</button>}
                
                {showCourseForm && (
                  <form onSubmit={handleCreateCourse} className="bg-white p-6 rounded-xl shadow-lg border space-y-4 relative">
                    <button type="button" onClick={() => setShowCourseForm(false)} className="absolute top-4 right-4 text-gray-400 font-bold">Cancel</button>
                    <h3 className="font-bold text-lg">New Course Overview</h3>
                    <div className="flex items-center gap-4"><div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">{newCourse.image ? <img src={newCourse.image} className="w-full h-full object-cover"/> : <Video className="text-gray-300"/>}</div><div><p className="text-xs font-bold text-gray-500 mb-1">Cover Image</p><UploadButton onUpload={(url) => setNewCourse({...newCourse, image: url})} /></div></div>
                    <input aria-label="Title" required placeholder="Course Title" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                    <textarea aria-label="Desc" required placeholder="Description" className="w-full border p-3 rounded-lg h-24" onChange={e => setNewCourse({...newCourse, description: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4"><input aria-label="Price" required type="number" placeholder="Price ($)" className="border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, price: e.target.value})} /><input aria-label="Schedule" required type="text" placeholder="Schedule" className="border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, schedule: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4"><input aria-label="Start" required type="date" className="border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, startDate: e.target.value})} /><input aria-label="End" required type="date" className="border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, endDate: e.target.value})} /></div>
                    <input aria-label="Link" placeholder="Classroom Link (Optional)" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, classroomUrl: e.target.value})} />
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Save & Add Modules →</button>
                  </form>
                )}

                <div className="grid gap-4">
                  {courses.map(course => (
                    <div key={course.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
                      <div><h4 className="font-bold">{course.title}</h4><p className="text-xs text-gray-500">{new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => router.push(`/teacher/course-editor/${course.id}`)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-100"><FileText size={16}/> Manage Content</button>
                        <button aria-label="Delete" onClick={() => handleDeleteCourse(course.id)} className="text-red-400 bg-red-50 p-2 rounded-lg hover:bg-red-100"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (<div className="bg-white rounded-2xl shadow-sm border p-1 h-[600px]"><ChatWindow myId={teacher.id} myType="teacher" /></div>)}
            
            {activeTab === 'wallet' && (<div className="space-y-6"><div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-lg"><p className="text-green-100 font-bold uppercase text-xs tracking-wider mb-1">Available</p><h2 className="text-5xl font-bold">${wallet.availableBalance?.toLocaleString()}</h2></div><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="font-bold text-lg mb-4 text-gray-800">Withdraw</h3><div className="space-y-4"><input aria-label="Bank" className="w-full border p-3 rounded-lg" placeholder="Bank Name" onChange={e => setBankForm({...bankForm, bankName: e.target.value})} /><input aria-label="Num" className="w-full border p-3 rounded-lg" placeholder="Account Number" onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} /><input aria-label="Name" className="w-full border p-3 rounded-lg" placeholder="Account Name" onChange={e => setBankForm({...bankForm, accountName: e.target.value})} /><input aria-label="Amt" type="number" className="w-full border p-3 rounded-lg" placeholder="Amount ($)" onChange={e => setBankForm({...bankForm, amount: e.target.value})} /><button onClick={handleWithdraw} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800">Withdraw</button></div></div><div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="font-bold text-lg mb-4 text-gray-800">History</h3><div className="space-y-3 max-h-80 overflow-y-auto">{wallet.payouts?.map((p: any) => (<div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"><div><p className="font-bold text-gray-900">${p.amount}</p><p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p></div><span className={`text-xs font-bold px-2 py-1 rounded capitalize ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></div>))}</div></div></div></div>)}

            {activeTab === 'verification' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="mb-6 flex justify-center">{teacher.verificationStatus === 'verified' ? (<div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><BadgeCheck size={40}/></div>) : teacher.verificationStatus === 'pending' ? (<div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center"><Clock size={40}/></div>) : (<div className="w-20 h-20 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center"><FileText size={40}/></div>)}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{teacher.verificationStatus === 'verified' ? "You are Verified!" : teacher.verificationStatus === 'pending' ? "Pending Review" : "Get Verified"}</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">{teacher.verificationStatus === 'verified' ? "You have the blue badge." : "Upload a valid ID to get the blue badge."}</p>
                    {teacher.verificationStatus === 'none' || teacher.verificationStatus === 'rejected' ? (<div className="flex flex-col items-center gap-4"><UploadButton onUpload={handleUploadVerification} /><p className="text-xs text-gray-400">Supported: JPG, PNG, PDF</p></div>) : null}
                </div>
            )}

            {/* BOOST PROFILE (Updated for AccountPe) */}
            {activeTab === 'boost' && (
              <div className="space-y-6 animate-in fade-in">
                {packages.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No ad packages available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className={`bg-white border-2 rounded-2xl p-6 hover:shadow-lg transition ${getPackageStyle(pkg.name)}`}>
                        {pkg.name.toLowerCase().includes('gold') && <div className="text-xs font-bold text-yellow-600 uppercase mb-2">⭐ Best Value</div>}
                        <h4 className="font-bold text-lg">{pkg.name}</h4>
                        <p className="text-3xl font-bold mb-2">${pkg.price}</p>
                        <p className="text-sm text-gray-500 mb-6">{pkg.description}</p>
                        <div className="mb-6 space-y-2">{pkg.features.split(',').map((f: string, i: number) => (<p key={i} className="text-xs flex gap-2 items-center text-gray-600"><CheckCircle2 size={12} className="text-green-500"/> {f.trim()}</p>))}</div>
                        {/* ACCOUNTPE BUTTON */}
                        <button onClick={() => handleBuyPackage(pkg.name.toLowerCase(), pkg.price)} disabled={processingPackage} className={`w-full py-3 rounded-lg font-bold transition shadow-sm ${getButtonStyle(pkg.name)} flex justify-center items-center gap-2`}>
                          {processingPackage ? <Loader2 className="animate-spin"/> : `Buy ${pkg.name}`}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
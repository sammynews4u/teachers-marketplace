"use client";

import Navbar from '../../components/Navbar';
import ChatWindow from '../../components/ChatWindow'; 
import UploadButton from '../../components/UploadButton'; 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackConversion } from '../../lib/analytics';
import dynamic from 'next/dynamic';
import { 
  Users, DollarSign, Calendar, Edit2, 
  Clock, MessageSquare, Star, Video, Plus, Trash2, 
  CheckCircle2, ShieldCheck, ArrowRight, Crown, Rocket, Zap, Megaphone, Wallet
} from 'lucide-react';

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

  // WALLET STATE
  const [wallet, setWallet] = useState<any>({ availableBalance: 0, payouts: [], totalEarnings: 0 });
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountName: '', amount: '' });

  // ONBOARDING
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // COURSE FORM
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', price: '', startDate: '', endDate: '', schedule: '', classroomUrl: ''
  });
  const [showCourseForm, setShowCourseForm] = useState(false);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_1a823085e1393c55ce245b02feb6a316e6c6ad49';

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

  }, []);

  // --- HANDLERS ---

  // Initialize Chat
  const handleStartChat = async (studentId: string) => {
    if (!confirm("Start a conversation with this student?")) return;
    
    // Create the conversation by sending a system message
    await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        senderId: teacher.id,
        senderType: 'teacher',
        receiverId: studentId,
        content: "Hello! Welcome to my class."
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Switch to messages tab
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
    const res = await fetch('/api/courses', { method: 'POST', body: JSON.stringify({ ...newCourse, teacherId: teacher.id }) });
    if (res.ok) {
      alert("Course Created!"); setShowCourseForm(false);
      fetch(`/api/courses?teacherId=${teacher.id}`).then(r => r.json()).then(setCourses);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if(!confirm("Delete this course?")) return;
    await fetch('/api/courses', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetch(`/api/courses?teacherId=${teacher.id}`).then(r => r.json()).then(setCourses);
  };

  const handlePackageSuccess = async (reference: any, plan: string, amount: number) => {
    const res = await fetch('/api/packages/purchase', {
      method: 'POST', body: JSON.stringify({ teacherId: teacher.id, plan, amount, reference: reference.reference }), headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) { 
      trackConversion('Purchase', amount);
      alert("Success!"); 
      window.location.reload(); 
    }
  };

  const handleWithdraw = async () => {
    if(parseInt(bankForm.amount) > wallet.availableBalance) return alert("Insufficient funds");
    if(!bankForm.bankName || !bankForm.accountNumber) return alert("Please fill bank details");
    
    await fetch('/api/payouts', { method: 'PUT', body: JSON.stringify({ teacherId: teacher.id, ...bankForm }) });
    alert("Withdrawal Request Sent!");
    window.location.reload();
  };

  const getGreeting = () => {
    const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  };

  if (!mounted) return null;
  if (!teacher) return <div className="p-20 text-center text-blue-600 font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative pt-16"> 
      <Navbar />

      {/* UPGRADE ALERT */}
      {teacher.plan === 'free' && (
        <div onClick={() => setActiveTab('boost')} className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 text-center cursor-pointer hover:opacity-90 transition shadow-md group">
          <p className="font-bold text-sm flex items-center justify-center gap-2 animate-pulse"><Megaphone size={20} /> UPGRADE TO GET MORE STUDENTS! <span className="underline">Boost Now</span><ArrowRight size={18} /></p>
        </div>
      )}

      {/* ONBOARDING MODAL */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="h-32 bg-blue-600 flex items-center justify-center"><ShieldCheck className="text-white w-16 h-16" /></div>
            <div className="p-8">
              {onboardingStep === 1 && (
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Welcome Teacher! 👋</h2>
                  <p className="text-gray-500">Let's set you up to teach languages effectively.</p>
                  <button onClick={() => setOnboardingStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Start Tour</button>
                </div>
              )}
              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center">Success Tips 🚀</h2>
                  <div className="space-y-4">
                    <div className="flex gap-4"><div className="bg-green-100 p-3 rounded"><CheckCircle2 className="text-green-600"/></div><div><h4 className="font-bold">Get Verified</h4><p className="text-sm text-gray-500">Verified tutors get 3x more students.</p></div></div>
                  </div>
                  <button onClick={() => setOnboardingStep(3)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Next</button>
                </div>
              )}
              {onboardingStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-center">Terms</h2>
                  <div className="h-32 overflow-y-auto bg-gray-50 p-4 text-xs border"><p>1. Be professional.<br/>2. No-shows penalized.</p></div>
                  <button onClick={handleFinishOnboarding} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">I Agree & View Plans</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-8 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-gray-500 font-medium">{getGreeting()},</p>
              {teacher.plan === 'gold' && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-300 flex items-center gap-1"><Crown size={12}/> GOLD</span>}
              {teacher.plan === 'silver' && <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-gray-300 flex items-center gap-1"><ShieldCheck size={12}/> SILVER</span>}
            </div>
            <h1 className="text-4xl font-bold text-gray-900">{teacher.name} 👋</h1>
          </div>
          <button onClick={() => { localStorage.removeItem('teacherId'); router.push('/'); }} className="text-red-500 font-medium">Log Out</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: PROFILE & EARNINGS */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border text-center relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-20 bg-gradient-to-r ${teacher.plan === 'gold' ? 'from-yellow-400 to-orange-500' : 'from-blue-600 to-purple-600'}`}></div>
               <img src={teacher.image} className="relative w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-4 mt-8"/>
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
                    <h2 className="text-xl font-bold">{teacher.name}</h2>
                    <p className="text-blue-600 font-medium text-sm">{teacher.subject}</p>
                    <p className="font-bold mt-2">${teacher.hourlyRate}/hr</p>
                    <button onClick={() => setIsEditing(true)} className="text-sm text-gray-400 mt-4 underline">Edit Profile</button>
                  </>
               )}
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border"><p className="text-gray-500 text-xs font-bold uppercase">Earnings</p><p className="text-2xl font-bold text-green-600">${earnings.toLocaleString()}</p></div>
          </div>

          {/* RIGHT: CONTENT TABS */}
          <div className="lg:col-span-2">
            
            {/* TAB BUTTONS */}
            <div className="flex flex-wrap gap-4 mb-6 bg-gray-200 p-1 rounded-2xl w-fit">
              <button onClick={() => setActiveTab('classroom')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'classroom' ? 'bg-white shadow' : 'text-gray-500'}`}>Classroom</button>
              <button onClick={() => setActiveTab('courses')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'courses' ? 'bg-white shadow' : 'text-gray-500'}`}>My Courses</button>
              <button onClick={() => setActiveTab('messages')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'messages' ? 'bg-white shadow' : 'text-gray-500'}`}>Messages</button>
              <button onClick={() => setActiveTab('wallet')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'wallet' ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}>💰 Wallet</button>
              <button onClick={() => setActiveTab('boost')} className={`px-6 py-2 rounded-xl font-bold transition text-sm ${activeTab === 'boost' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow' : 'text-gray-500'}`}>🚀 Boost</button>
            </div>

            {/* TAB 1: CLASSROOM */}
            {activeTab === 'classroom' && (
              <div className="bg-white rounded-2xl shadow-sm border p-6 animate-in fade-in">
                 <h3 className="font-bold text-lg mb-4">Students Enrolled</h3>
                 {teacher.bookings?.length === 0 ? <p className="text-gray-400">No students yet.</p> : (
                   <div className="divide-y">
                     {teacher.bookings.map((b: any) => (
                       <div key={b.id} className="py-4 flex justify-between items-center">
                         <div className="flex gap-3 items-center">
                           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${b.student?.name}`} className="w-10 h-10 rounded-full"/>
                           <div>
                             <p className="font-bold">{b.student?.name}</p>
                             <p className="text-xs text-gray-500 flex items-center gap-1">
                               {b.type === 'trial' ? 'Free Trial' : 'Paid Student'}
                               {b.scheduledAt && <span className="text-orange-500 font-bold ml-1">• {new Date(b.scheduledAt).toLocaleDateString()}</span>}
                             </p>
                           </div>
                         </div>
                         <button onClick={() => handleStartChat(b.student?.id)} aria-label="Chat" className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition"><MessageSquare size={18}/></button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {/* TAB 2: COURSES */}
            {activeTab === 'courses' && (
              <div className="space-y-6 animate-in fade-in">
                {!showCourseForm && <button onClick={() => setShowCourseForm(true)} className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 flex justify-center items-center gap-2"><Plus size={20} /> Create New Cohort</button>}
                
                {showCourseForm && (
                  <form onSubmit={handleCreateCourse} className="bg-white p-6 rounded-xl shadow-lg border space-y-4 relative">
                    <button type="button" onClick={() => setShowCourseForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold">Cancel</button>
                    <h3 className="font-bold text-lg">New Language Course</h3>
                    <input aria-label="Title" required placeholder="Title (e.g. Beginners French)" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                    <textarea aria-label="Desc" required placeholder="Description" className="w-full border p-3 rounded-lg h-24" onChange={e => setNewCourse({...newCourse, description: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input aria-label="Price" required type="number" placeholder="Price" className="border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, price: e.target.value})} />
                      <input aria-label="Schedule" required type="text" placeholder="Schedule" className="border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, schedule: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input aria-label="Start" required type="date" className="border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, startDate: e.target.value})} />
                      <input aria-label="End" required type="date" className="border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, endDate: e.target.value})} />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <label className="block text-xs font-bold text-blue-800 mb-1">GOOGLE CLASSROOM LINK (Optional)</label>
                      <input aria-label="Link" placeholder="e.g. https://classroom.google.com/c/..." className="w-full border p-3 rounded-lg bg-white" onChange={e => setNewCourse({...newCourse, classroomUrl: e.target.value})} />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Publish Course</button>
                  </form>
                )}

                <div className="grid gap-4">
                  {courses.map(course => (
                    <div key={course.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between">
                      <div><h4 className="font-bold">{course.title}</h4><p className="text-xs text-gray-500">{new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}</p></div>
                      <button aria-label="Delete" onClick={() => handleDeleteCourse(course.id)} className="text-red-400"><Trash2 size={20}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MESSAGES (CHAT) */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-2xl shadow-sm border p-1 animate-in fade-in h-[600px]">
                <ChatWindow myId={teacher.id} myType="teacher" />
              </div>
            )}

            {/* TAB 4: WALLET */}
            {activeTab === 'wallet' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
                  <p className="text-green-100 font-bold uppercase text-xs tracking-wider mb-1">Available to Withdraw</p>
                  <h2 className="text-5xl font-bold">${wallet.availableBalance?.toLocaleString()}</h2>
                  <p className="mt-4 text-sm opacity-80">Total Lifetime Earnings: ${wallet.totalEarnings?.toLocaleString()}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Request Withdrawal</h3>
                    <div className="space-y-4">
                      <input aria-label="Bank" className="w-full border p-3 rounded-lg" placeholder="Bank Name" onChange={e => setBankForm({...bankForm, bankName: e.target.value})} />
                      <input aria-label="Account Num" className="w-full border p-3 rounded-lg" placeholder="Account Number" onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} />
                      <input aria-label="Account Name" className="w-full border p-3 rounded-lg" placeholder="Account Name" onChange={e => setBankForm({...bankForm, accountName: e.target.value})} />
                      <input aria-label="Amount" type="number" className="w-full border p-3 rounded-lg" placeholder="Amount ($)" onChange={e => setBankForm({...bankForm, amount: e.target.value})} />
                      <button onClick={handleWithdraw} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800">Withdraw Funds</button>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Payout History</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {wallet.payouts?.length === 0 && <p className="text-gray-400 text-sm">No history yet.</p>}
                      {wallet.payouts?.map((p: any) => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                           <div><p className="font-bold text-gray-900">${p.amount}</p><p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p></div>
                           <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BOOST PROFILE */}
            {activeTab === 'boost' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* BRONZE - $10 */}
                  <div className="bg-white border rounded-2xl p-6 hover:shadow-lg"><h4 className="text-orange-800 font-bold">Bronze</h4><p className="text-2xl font-bold mb-4">$10</p>
                    {/* @ts-ignore */}
                    <PaystackButton email={teacher.email} amount={10 * 100} currency="USD" publicKey={publicKey} text="Buy Bronze" onSuccess={(ref: any) => handlePackageSuccess(ref, 'bronze', 10)} className="w-full bg-orange-100 text-orange-700 font-bold py-3 rounded-lg"/>
                  </div>
                  {/* SILVER - $20 */}
                  <div className="bg-white border rounded-2xl p-6 hover:shadow-lg"><h4 className="text-gray-600 font-bold">Silver</h4><p className="text-2xl font-bold mb-4">$20</p>
                    {/* @ts-ignore */}
                    <PaystackButton email={teacher.email} amount={20 * 100} currency="USD" publicKey={publicKey} text="Buy Silver" onSuccess={(ref: any) => handlePackageSuccess(ref, 'silver', 20)} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg"/>
                  </div>
                  {/* GOLD - $30 */}
                  <div className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg relative"><div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-bl">BEST</div><h4 className="text-yellow-600 font-bold">Gold</h4><p className="text-2xl font-bold mb-4">$30</p>
                    {/* @ts-ignore */}
                    <PaystackButton email={teacher.email} amount={30 * 100} currency="USD" publicKey={publicKey} text="Buy Gold" onSuccess={(ref: any) => handlePackageSuccess(ref, 'gold', 30)} className="w-full bg-yellow-500 text-white font-bold py-3 rounded-lg"/>
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
"use client";

import Navbar from '../../components/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { Calendar, CheckCircle2, Video, BookOpen, Clock } from 'lucide-react';
import { trackConversion } from '@/lib/analytics';

export default function HirePage() {
  const params = useParams();
  const router = useRouter();
  
  // Data State
  const [teacher, setTeacher] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  
  // Booking Form State
  const [bookingType, setBookingType] = useState<'paid' | 'trial' | 'course'>('paid');
  const [trialDate, setTrialDate] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // PAYSTACK KEY
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_1a823085e1393c55ce245b02feb6a316e6c6ad49';

  useEffect(() => {
    // 1. Check Login
    const sid = localStorage.getItem('studentId');
    if (!sid) {
      alert("Please login as a student first.");
      router.push('/student-login');
      return;
    }
    setStudentId(sid);

    // 2. Fetch Teacher & Courses
    if (params.id) {
      fetch('/api/teachers')
        .then(res => res.json())
        .then(data => {
          const found = data.find((t: any) => t.id === params.id);
          setTeacher(found);
          
          // Fetch Courses for this teacher
          if (found) {
            fetch(`/api/courses?teacherId=${found.id}`)
              .then(cRes => cRes.json())
              .then(cData => setCourses(cData));
          }
        });
    }
  }, [params.id, router]);

  // --- HANDLERS ---

  const handlePaidSuccess = async (reference: any) => {
    // Standard Hourly Booking
    await saveBooking(teacher.hourlyRate, reference.reference, 'paid', null, null);
  };

  const handleCourseSuccess = async (reference: any) => {
    // Course/Cohort Booking
    if (!selectedCourse) return;
    await saveBooking(selectedCourse.price, reference.reference, 'course', null, selectedCourse.id);
  };

  const handleTrialSubmit = async () => {
    // Free Trial (No Payment)
    if (!trialDate) return alert("Please select a date and time for the call.");
    await saveBooking(0, "TRIAL-" + Date.now(), 'trial', trialDate, null);
  };

  const saveBooking = async (amount: number, ref: string | null, type: string, date: string | null, courseId: string | null) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          teacherId: teacher.id,
          studentId: studentId,
          amount: amount,
          reference: ref,
          type: type,
          scheduledAt: date,
          courseId: courseId 
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        // --- ANALYTICS TRACKING ---
        if (type === 'trial') {
          // Track as a Lead (Form submission)
          trackConversion('Lead'); 
          alert("Trial Booked Successfully!");
        } else {
          // Track as a Purchase (Revenue)
          trackConversion('Purchase', amount); 
          alert("Booking Successful!");
        }
        // --------------------------

        router.push('/student-dashboard');
      } else {
        alert("Booking Failed.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  };

  // --- PAYSTACK CONFIG ---
  const hourlyPayProps = {
    email: "student@platform.com",
    amount: teacher ? teacher.hourlyRate * 100 : 0,
    publicKey,
    currency: 'USD',
    text: "Pay Now",
    onSuccess: handlePaidSuccess,
    onClose: () => alert("Payment cancelled"),
  };

  const coursePayProps = {
    email: "student@platform.com",
    amount: selectedCourse ? selectedCourse.price * 100 : 0,
    publicKey,
    currency: 'USD',
    text: `Pay $${selectedCourse?.price?.toLocaleString()}`,
    onSuccess: handleCourseSuccess,
    onClose: () => alert("Payment cancelled"),
  };

  if (!teacher) return <div className="p-20 text-center text-blue-600 font-bold">Loading Teacher Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-12 px-4 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          
          {/* LEFT SIDE: Teacher Info */}
          <div className="p-8 md:w-5/12 bg-blue-600 text-white flex flex-col">
            <div className="flex-1">
              <img src={teacher.image} alt={teacher.name} className="w-24 h-24 rounded-full border-4 border-white/30 mb-6 object-cover bg-white" />
              <h1 className="text-3xl font-bold mb-2">{teacher.name}</h1>
              <p className="text-blue-100 text-lg mb-6">{teacher.subject} Expert</p>
              
              <div className="space-y-4 text-blue-50">
                <div className="flex items-center gap-3"><CheckCircle2 size={20}/> Verified Tutor</div>
                <div className="flex items-center gap-3"><Video size={20}/> 1-on-1 Online Calls</div>
                <div className="flex items-center gap-3"><Calendar size={20}/> Flexible Schedule</div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-blue-500">
              <p className="text-sm text-blue-200 uppercase font-bold tracking-wider">Standard Rate</p>
              <p className="text-4xl font-bold">${teacher.hourlyRate.toLocaleString()}<span className="text-lg font-normal text-blue-200">/hr</span></p>
            </div>
          </div>

          {/* RIGHT SIDE: Booking Options */}
          <div className="p-8 md:w-7/12 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Session</h2>

            {/* TABS */}
            <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8">
              <button 
                onClick={() => setBookingType('paid')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${bookingType === 'paid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Standard
              </button>
              <button 
                onClick={() => setBookingType('course')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${bookingType === 'course' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Courses
              </button>
              <button 
                onClick={() => setBookingType('trial')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${bookingType === 'trial' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Free Trial
              </button>
            </div>

            {/* --- CONTENT: STANDARD --- */}
            {bookingType === 'paid' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-2">Regular 1-on-1 Lesson</h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex gap-2"><CheckCircle2 size={16}/> Full 60 minutes session</li>
                    <li className="flex gap-2"><CheckCircle2 size={16}/> Customized learning plan</li>
                    <li className="flex gap-2"><CheckCircle2 size={16}/> Access to class materials</li>
                  </ul>
                </div>
                <div className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition text-center cursor-pointer shadow-lg shadow-gray-900/20">
                  {/* @ts-ignore */}
                  <PaystackButton {...hourlyPayProps} className="w-full h-full" />
                </div>
              </div>
            )}

            {/* --- CONTENT: COURSES --- */}
            {bookingType === 'course' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {courses.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl">
                    <BookOpen className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-gray-500">No active cohorts available right now.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {courses.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => setSelectedCourse(c)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedCourse?.id === c.id ? 'border-purple-600 bg-purple-50 shadow-sm ring-1 ring-purple-600' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-900">{c.title}</span>
                            <span className="font-bold text-purple-600 bg-white px-2 py-1 rounded border border-purple-100 text-sm">${c.price.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                             <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</span>
                             <span className="flex items-center gap-1"><Clock size={12}/> {c.schedule}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedCourse ? (
                      <div className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition text-center cursor-pointer shadow-lg shadow-purple-600/20">
                        {/* @ts-ignore */}
                        <PaystackButton {...coursePayProps} className="w-full h-full" />
                      </div>
                    ) : (
                      <button disabled className="w-full bg-gray-200 text-gray-400 font-bold py-4 rounded-xl cursor-not-allowed">
                        Select a course above
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* --- CONTENT: FREE TRIAL --- */}
            {bookingType === 'trial' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                  <h3 className="font-bold text-green-800 mb-2">Discovery Call</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex gap-2"><CheckCircle2 size={16}/> 20 Minutes introduction</li>
                    <li className="flex gap-2"><CheckCircle2 size={16}/> Discuss your learning goals</li>
                    <li className="flex gap-2"><CheckCircle2 size={16}/> Completely Free</li>
                  </ul>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Date & Time</label>
                  <input 
                    aria-label="Select Trial Date"
                    type="datetime-local" 
                    className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                    onChange={(e) => setTrialDate(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleTrialSubmit}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-600/20"
                >
                  Confirm Free Trial
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
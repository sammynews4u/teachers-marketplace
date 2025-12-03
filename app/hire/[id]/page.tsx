"use client";

import Navbar from '../../../components/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaystackButton } from 'react-paystack';
import { Calendar, CheckCircle2, Video } from 'lucide-react';

export default function HirePage() {
  const params = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  
  // New State for Booking Type
  const [bookingType, setBookingType] = useState<'paid' | 'trial'>('paid');
  const [trialDate, setTrialDate] = useState('');

  useEffect(() => {
    const sid = localStorage.getItem('studentId');
    if (!sid) {
      alert("Please login as a student first.");
      router.push('/student-login');
      return;
    }
    setStudentId(sid);

    if (params.id) {
      fetch('/api/teachers')
        .then(res => res.json())
        .then(data => {
          const found = data.find((t: any) => t.id === params.id);
          setTeacher(found);
        });
    }
  }, [params.id, router]);

  // Handle PAID Success
  const handlePaidSuccess = async (reference: any) => {
    await saveBooking(teacher.hourlyRate, reference.reference, 'paid', null);
  };

  // Handle TRIAL Submit
  const handleTrialSubmit = async () => {
    if (!trialDate) return alert("Please select a date and time for the call.");
    await saveBooking(0, null, 'trial', trialDate);
  };

  // Common Save Function
  const saveBooking = async (amount: number, ref: string | null, type: string, date: string | null) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        teacherId: teacher.id,
        studentId: studentId,
        amount: amount,
        reference: ref,
        type: type,
        scheduledAt: date
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      alert(type === 'trial' ? "Trial Booked Successfully!" : "Teacher Hired Successfully!");
      router.push('/student-dashboard');
    } else {
      alert("Booking Failed.");
    }
  };

  const paystackProps = {
    email: "student@platform.com",
    amount: teacher ? teacher.hourlyRate * 100 : 0,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_1a823085e1393c55ce245b02feb6a316e6c6ad49',
    text: "Pay Now",
    onSuccess: handlePaidSuccess,
    onClose: () => alert("Payment cancelled"),
  };

  if (!teacher) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-12 px-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          
          {/* Teacher Info (Left Side) */}
          <div className="p-8 md:w-1/2 bg-blue-600 text-white flex flex-col justify-between">
            <div>
              <img src={teacher.image} className="w-24 h-24 rounded-full border-4 border-white/30 mb-4 object-cover" />
              <h1 className="text-3xl font-bold mb-2">{teacher.name}</h1>
              <p className="text-blue-100 text-lg mb-6">{teacher.subject} Expert</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><CheckCircle2 size={18}/> Verified Tutor</div>
                <div className="flex items-center gap-2"><Video size={18}/> 1-on-1 Online Calls</div>
                <div className="flex items-center gap-2"><Calendar size={18}/> Flexible Schedule</div>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-sm text-blue-200 uppercase font-bold">Hourly Rate</p>
              <p className="text-4xl font-bold">₦{teacher.hourlyRate.toLocaleString()}</p>
            </div>
          </div>

          {/* Booking Options (Right Side) */}
          <div className="p-8 md:w-1/2 bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Booking Type</h2>

            {/* Toggle Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
              <button 
                onClick={() => setBookingType('paid')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${bookingType === 'paid' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
              >
                Standard Lesson
              </button>
              <button 
                onClick={() => setBookingType('trial')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${bookingType === 'trial' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
              >
                Free 20-min Trial
              </button>
            </div>

            {/* OPTION 1: PAID */}
            {bookingType === 'paid' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-blue-800 text-sm font-medium">✅ Full 1 Hour Lesson</p>
                  <p className="text-blue-800 text-sm font-medium">✅ Access to materials</p>
                </div>
                <div className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition text-center cursor-pointer">
                  {/* @ts-ignore */}
                  <PaystackButton {...paystackProps} className="w-full h-full" />
                </div>
              </div>
            )}

            {/* OPTION 2: TRIAL */}
            {bookingType === 'trial' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-green-800 text-sm font-medium">✅ 20 Minutes Introduction</p>
                  <p className="text-green-800 text-sm font-medium">✅ Discuss your goals</p>
                  <p className="text-green-800 text-sm font-medium">✅ Free of charge</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full p-3 border rounded-lg bg-gray-50"
                    onChange={(e) => setTrialDate(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleTrialSubmit}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition"
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
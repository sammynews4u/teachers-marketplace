"use client";

import Navbar from '../../../components/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaystackButton } from 'react-paystack';

export default function HirePage() {
  const params = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if Student is logged in
    const sid = localStorage.getItem('studentId');
    if (!sid) {
      alert("You must login as a Student to hire a teacher.");
      router.push('/student-login');
      return;
    }
    setStudentId(sid);

    // 2. Fetch Teacher
    if (params.id) {
      fetch('/api/teachers')
        .then(res => res.json())
        .then(data => {
          const found = data.find((t: any) => t.id === params.id);
          setTeacher(found);
        });
    }
  }, [params.id, router]);

  const componentProps = {
    email: "student@platform.com", // Paystack just needs *any* email for the receipt
    amount: teacher ? teacher.hourlyRate * 100 : 0,
    publicKey: 'pk_test_1a823085e1393c55ce245b02feb6a316e6c6ad49', // REPLACE WITH YOUR KEY
    text: "Pay Now",
    onSuccess: (reference: any) => handleSuccess(reference),
    onClose: () => alert("Payment cancelled"),
  };

  const handleSuccess = async (reference: any) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        teacherId: teacher.id,
        studentId: studentId, // Send the ID, not just an email
        amount: teacher.hourlyRate,
        reference: reference.reference
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      alert("Teacher Hired Successfully!");
      router.push('/my-teachers');
    }
  };

  if (!teacher) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 pb-12 px-4 max-w-lg mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <img src={teacher.image} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
          <h1 className="text-2xl font-bold">Hire {teacher.name}</h1>
          <p className="text-4xl font-bold text-blue-700 mt-4 mb-6">₦{teacher.hourlyRate.toLocaleString()}</p>
          
          <div className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition cursor-pointer">
               {/* @ts-ignore */}
               <PaystackButton {...componentProps} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
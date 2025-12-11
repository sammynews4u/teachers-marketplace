"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { trackConversion } from '@/lib/analytics';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference'); // Swychr usually sends ?reference=...
  
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    if (!reference) return;

    // Call our internal API to verify logic securely
    fetch(`/api/payment/verify?reference=${reference}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          // Track Conversion
          trackConversion('Purchase', data.amount);
          // Redirect after 3 seconds
          setTimeout(() => router.push('/student-dashboard'), 3000);
        } else {
          setStatus('failed');
        }
      });
  }, [reference, router]);

  if (status === 'verifying') return <div className="text-center p-20 font-bold text-blue-600">Verifying Payment...</div>;

  if (status === 'success') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <CheckCircle2 size={64} className="text-green-600 mb-4" />
      <h1 className="text-3xl font-bold text-green-900">Payment Successful!</h1>
      <p className="text-gray-600 mt-2">Redirecting you to your dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <XCircle size={64} className="text-red-600 mb-4" />
      <h1 className="text-3xl font-bold text-red-900">Payment Failed</h1>
      <button onClick={() => router.push('/teachers')} className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg">Try Again</button>
    </div>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { swychr } from '@/lib/swychr'; // Helper we created for Swychr
import { sendEmail } from '@/lib/email'; // Helper for SMTP

const prisma = new PrismaClient();

// POST: Create a Booking & Initialize Payment
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, studentId, amount, type, scheduledAt, courseId } = body;

    // 1. Fetch Student details (needed for email/payment)
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });

    if (!student || !teacher) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Generate a Unique Reference
    const reference = `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 3. Determine Initial Status
    // Trials are instant success, Paid bookings are pending until payment
    const initialStatus = type === 'trial' ? 'success' : 'pending';

    // 4. Save Booking to Database
    const booking = await prisma.booking.create({
      data: {
        teacherId,
        studentId,
        amount: parseInt(amount),
        reference,
        status: initialStatus,
        type: type || 'paid',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        courseId,
        isRefunded: false
      }
    });

    // --- LOGIC BRANCH: FREE TRIAL ---
    if (type === 'trial') {
      // Send Email Notifications Immediately
      await sendEmail(student.email, "Trial Booked!", `<p>You have booked a free trial with ${teacher.name}.</p>`);
      await sendEmail(teacher.email, "New Trial Request", `<p>${student.name} has booked a free trial.</p>`);

      return NextResponse.json({ success: true, booking });
    }

    // --- LOGIC BRANCH: PAID BOOKING (SWYCHR) ---
    else {
      // Initialize Payment with Swychr
      const paymentData = await swychr.initialize({
        email: student.email,
        amount: parseInt(amount),
        ref: reference,
        // Where Swychr redirects after payment (Create this page next if you haven't)
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback` 
      });

      if (paymentData && paymentData.status) {
        return NextResponse.json({ 
          success: true, 
          paymentUrl: paymentData.data.authorization_url, // Redirect frontend here
          reference 
        });
      } else {
        // If Gateway fails, delete the pending booking to keep DB clean
        await prisma.booking.delete({ where: { id: booking.id } });
        return NextResponse.json({ error: "Payment Gateway Initialization Failed" }, { status: 502 });
      }
    }

  } catch (error) {
    console.error("Booking Error:", error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}

// GET: Fetch Bookings (For Admin or Dashboards)
export async function GET(req: Request) {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        teacher: { select: { name: true, email: true } },
        student: { select: { name: true, email: true } },
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
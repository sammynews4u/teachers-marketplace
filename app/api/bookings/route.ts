import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { accountpe } from '@/lib/accountpe'; // <--- UPDATED: Using AccountPe
import { sendEmail } from '@/lib/email'; 

const prisma = new PrismaClient();

// POST: Create a Booking & Initialize Payment
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, studentId, amount, type, scheduledAt, courseId } = body;

    // 1. Fetch Student & Teacher
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });

    if (!student || !teacher) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Generate a Unique Reference
    const reference = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. Determine Initial Status
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
      await sendEmail(student.email, "Trial Booked!", `<p>You have booked a free trial with ${teacher.name}.</p>`);
      await sendEmail(teacher.email, "New Trial Request", `<p>${student.name} has booked a free trial.</p>`);
      return NextResponse.json({ success: true, booking });
    }

    // --- LOGIC BRANCH: PAID BOOKING (ACCOUNTPE) ---
    else {
      // AccountPe requires Name, Email, Amount, and Ref
      const paymentData = await accountpe.initialize({
        name: student.name, // <--- Required by AccountPe YAML
        email: student.email,
        amount: parseInt(amount),
        ref: reference,
        mobile: "0000000000" // Placeholder mobile, or add to student DB
      });

      if (paymentData.status && paymentData.paymentUrl) {
        return NextResponse.json({ 
          success: true, 
          paymentUrl: paymentData.paymentUrl, // Redirect URL from AccountPe
          reference 
        });
      } else {
        // If Gateway fails, delete the pending booking
        await prisma.booking.delete({ where: { id: booking.id } });
        console.error("AccountPe Error:", paymentData);
        return NextResponse.json({ error: "Payment Gateway Initialization Failed" }, { status: 502 });
      }
    }

  } catch (error) {
    console.error("Booking Error:", error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}

// GET: Fetch Bookings
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
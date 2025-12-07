import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/lib/email'; // Import the email utility

const prisma = new PrismaClient();

// POST: Create a New Booking & Send Emails
export async function POST(req: Request) {
  try {
    const { teacherId, studentId, amount, reference, type, scheduledAt, courseId } = await req.json();

    // 1. Determine Status & Reference based on Type
    // If trial, generate a fake reference. If paid, use Paystack reference.
    const finalReference = type === 'trial' ? `TRIAL-${Date.now()}` : reference;
    const finalStatus = type === 'trial' ? 'scheduled' : 'success';

    // 2. Save to Database
    const booking = await prisma.booking.create({
      data: {
        teacherId,
        studentId,
        amount,
        reference: finalReference,
        status: finalStatus,
        type: type || 'paid',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        courseId: courseId || null
      }
    });

    // 3. Fetch User Details for Emailing
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const course = courseId ? await prisma.course.findUnique({ where: { id: courseId } }) : null;

    // 4. Send SMTP Emails (If users exist)
    if (teacher && student) {
      
      // --- EMAIL TO STUDENT ---
      const studentSubject = type === 'trial' ? "Free Trial Confirmed! ✅" : "Booking Confirmed! 🎉";
      const studentMessage = `
        <h1>Hi ${student.name},</h1>
        <p>Your session with <strong>${teacher.name}</strong> has been confirmed.</p>
        
        <h3>Details:</h3>
        <ul>
          <li><strong>Type:</strong> ${type === 'trial' ? 'Free Trial (20 min)' : 'Paid Session'}</li>
          <li><strong>Amount:</strong> ₦${amount.toLocaleString()}</li>
          ${course ? `<li><strong>Course:</strong> ${course.title}</li>` : ''}
          ${scheduledAt ? `<li><strong>Date:</strong> ${new Date(scheduledAt).toLocaleString()}</li>` : ''}
        </ul>

        <p>You can chat with your teacher in your dashboard.</p>
        <br/>
        <a href="https://your-website.vercel.app/student-dashboard" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      `;

      await sendEmail(student.email, studentSubject, studentMessage);

      // --- EMAIL TO TEACHER ---
      const teacherSubject = type === 'trial' ? "New Free Trial Request 📅" : "New Paid Booking! 💰";
      const teacherMessage = `
        <h1>Hello ${teacher.name},</h1>
        <p>Good news! <strong>${student.name}</strong> has just booked a session with you.</p>
        
        <h3>Details:</h3>
        <ul>
          <li><strong>Student:</strong> ${student.name} (${student.email})</li>
          <li><strong>Type:</strong> ${type === 'trial' ? 'Free Trial Call' : 'Paid Session'}</li>
          <li><strong>Earnings:</strong> ₦${amount.toLocaleString()}</li>
          ${scheduledAt ? `<li><strong>Requested Time:</strong> ${new Date(scheduledAt).toLocaleString()}</li>` : ''}
        </ul>

        <p>Please log in to prepare for the session.</p>
        <br/>
        <a href="https://your-website.vercel.app/teacher-dashboard" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      `;

      await sendEmail(teacher.email, teacherSubject, teacherMessage);
    }

    return NextResponse.json({ success: true, booking });

  } catch (error) {
    console.error("Booking Error:", error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}

// GET: Fetch Bookings (With all details)
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        teacher: true,
        student: true,
        course: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
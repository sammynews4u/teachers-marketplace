import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/lib/email'; 

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { teacherId, studentId, amount, reference, type, scheduledAt, courseId } = await req.json();

    const finalReference = type === 'trial' ? `TRIAL-${Date.now()}` : reference;
    const finalStatus = type === 'trial' ? 'scheduled' : 'success';

    const booking = await prisma.booking.create({
      data: {
        teacherId, studentId, amount, reference: finalReference, status: finalStatus, type: type || 'paid',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        courseId: courseId || null
      }
    });

    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const course = courseId ? await prisma.course.findUnique({ where: { id: courseId } }) : null;

    if (teacher && student) {
      // EMAIL TO STUDENT
      const studentMessage = `
        <h1>Hi ${student.name},</h1>
        <p>Your session with <strong>${teacher.name}</strong> has been confirmed.</p>
        <ul>
          <li><strong>Amount:</strong> ₦${amount.toLocaleString()}</li>
          ${course ? `<li><strong>Course:</strong> ${course.title}</li>` : ''}
        </ul>

        ${course && course.classroomUrl ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px;">
            <strong>🎓 CLASSROOM ACCESS:</strong><br/>
            Click the link below to join the Google Classroom:<br/><br/>
            <a href="${course.classroomUrl}" style="background-color: #059669; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Join Google Classroom</a>
          </div>
        ` : ''}

        <a href="https://teachers-marketplace.vercel.app/student-dashboard">Go to Dashboard</a>
      `;

      await sendEmail(student.email, "Booking Confirmed! 🎉", studentMessage);

      // EMAIL TO TEACHER
      const teacherMessage = `
        <h1>Hello ${teacher.name},</h1>
        <p><strong>${student.name}</strong> has just booked a session.</p>
        <a href="https://teachers-marketplace.vercel.app/teacher-dashboard">Go to Dashboard</a>
      `;
      await sendEmail(teacher.email, "New Booking! 💰", teacherMessage);
    }

    return NextResponse.json({ success: true, booking });

  } catch (error) {
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { teacher: true, student: true, course: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
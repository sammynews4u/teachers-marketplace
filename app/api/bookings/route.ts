import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Create a new booking
export async function POST(req: Request) {
  try {
    const { teacherId, studentId, amount, reference } = await req.json();

    const booking = await prisma.booking.create({
      data: {
        teacherId,
        studentId, // We link the specific student account now
        amount,
        reference,
        status: "success"
      }
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}

// GET: Get all bookings (for Admin or Teacher)
export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: {
      teacher: true,
      student: true // Include student details
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(bookings);
}
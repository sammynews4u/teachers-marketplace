import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { studentId } = await req.json();

    const bookings = await prisma.booking.findMany({
      where: {
        studentId: studentId // Only find bookings for this student
      },
      include: {
        teacher: true // Get the teacher's details (Name, Image, etc)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching bookings' }, { status: 500 });
  }
}
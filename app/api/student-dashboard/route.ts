import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Get Student Data + Hired Teachers
export async function POST(req: Request) {
  try {
    const { studentId } = await req.json();

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { 
        bookings: {
          include: { teacher: true }, // Get teacher details
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

// PUT: Update Student Profile (Name & Image)
export async function PUT(req: Request) {
  try {
    const { id, name, image } = await req.json();

    const updated = await prisma.student.update({
      where: { id },
      data: { name, image }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
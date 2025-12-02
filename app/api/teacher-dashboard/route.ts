import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { teacherId } = await req.json();

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { 
        bookings: {
          include: { 
            student: true // <--- THIS IS KEY: Get the Student details!
          },
          orderBy: {
            createdAt: 'desc'
          }
        } 
      }
    });

    return NextResponse.json(teacher);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}

// Keep the PUT function (Update Profile) as it is.
export async function PUT(req: Request) {
  const body = await req.json();
  const { id, name, subject, hourlyRate } = body;

  const updated = await prisma.teacher.update({
    where: { id },
    data: { name, subject, hourlyRate: parseInt(hourlyRate) }
  });

  return NextResponse.json(updated);
}
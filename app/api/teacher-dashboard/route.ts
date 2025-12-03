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
// app/api/teacher-dashboard/route.ts

// ... (keep POST function as is)

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, subject, hourlyRate, hasOnboarded } = body;

    // Create an object with only the fields that are present
    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (subject) dataToUpdate.subject = subject;
    if (hourlyRate) dataToUpdate.hourlyRate = parseInt(hourlyRate);
    
    // This fixes the Onboarding loop:
    if (hasOnboarded === true || hasOnboarded === false) {
      dataToUpdate.hasOnboarded = hasOnboarded;
    }

    const updated = await prisma.teacher.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
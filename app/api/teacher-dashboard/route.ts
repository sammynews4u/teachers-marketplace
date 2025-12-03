import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Get Teacher Data (Profile + Students)
export async function POST(req: Request) {
  try {
    const { teacherId } = await req.json();

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { 
        bookings: {
          include: { 
            student: true 
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

// PUT: Update Teacher Profile (Includes Onboarding Fix)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, subject, hourlyRate, hasOnboarded } = body;

    // Create an object with only the fields that are present
    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (subject) dataToUpdate.subject = subject;
    if (hourlyRate) dataToUpdate.hourlyRate = parseInt(hourlyRate);
    
    // Explicitly check for boolean to allow 'false'
    if (hasOnboarded === true || hasOnboarded === false) {
      dataToUpdate.hasOnboarded = hasOnboarded;
    }

    const updated = await prisma.teacher.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
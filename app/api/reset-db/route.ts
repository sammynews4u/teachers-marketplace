import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force this route to always run fresh
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // 1. Delete Dependent Data (Children)
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.course.deleteMany({});

    // 2. Delete Main Data (Parents)
    const teachers = await prisma.teacher.deleteMany({});
    const students = await prisma.student.deleteMany({});
    const packages = await prisma.package.deleteMany({});
    
    // Optional: Delete FAQs if you want
    // await prisma.fAQ.deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: `Database Wiped! Deleted ${teachers.count} Teachers, ${students.count} Students, and ${packages.count} Packages.` 
    });

  } catch (error) {
    console.error("Reset Error:", error);
    return NextResponse.json({ error: "Failed to reset database", details: String(error) }, { status: 500 });
  }
}
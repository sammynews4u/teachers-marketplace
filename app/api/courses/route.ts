import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Create a New Course
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, title, description, price, startDate, endDate, schedule, classroomUrl, image } = body;

    const course = await prisma.course.create({
      data: {
        teacherId,
        title,
        description,
        price: parseInt(price),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        schedule,
        classroomUrl,
        image, // <--- Added Image
        published: false // Draft by default
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}

// GET: Fetch Courses (Can filter by teacherId)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacherId');

  const where = teacherId ? { teacherId } : {};

  const courses = await prisma.course.findMany({
    where,
    orderBy: { startDate: 'asc' },
    include: {
        modules: {
            include: { lessons: true } // Fetch structure stats
        },
        bookings: true
    }
  });

  return NextResponse.json(courses);
}

// DELETE: Remove a Course
export async function DELETE(req: Request) {
  const { id } = await req.json();
  // Deep delete is handled by Cascade in schema or manually here if needed
  await prisma.booking.deleteMany({ where: { courseId: id } });
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
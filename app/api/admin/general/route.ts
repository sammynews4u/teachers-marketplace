import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch Everything (Users, Pages, Packages)
export async function GET() {
  const teachers = await prisma.teacher.findMany();
  const students = await prisma.student.findMany();
  const pages = await prisma.page.findMany();
  const packages = await prisma.package.findMany();
  
  return NextResponse.json({ teachers, students, pages, packages });
}

// DELETE: Remove User
export async function DELETE(req: Request) {
  const { id, type } = await req.json();

  try {
    if (type === 'teacher') {
      // Delete bookings first to avoid database error
      await prisma.booking.deleteMany({ where: { teacherId: id } });
      await prisma.teacher.delete({ where: { id } });
    } else if (type === 'student') {
      await prisma.booking.deleteMany({ where: { studentId: id } });
      await prisma.student.delete({ where: { id } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

// POST: Create/Update Page
export async function POST(req: Request) {
  const { slug, title, content } = await req.json();

  const page = await prisma.page.upsert({
    where: { slug },
    update: { title, content },
    create: { slug, title, content }
  });

  return NextResponse.json(page);
}
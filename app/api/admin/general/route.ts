import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch Everything (Teachers, Students, Pages, Packages, Stats)
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { createdAt: 'desc' },
      include: { bookings: true } // To calculate revenue
    });
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const pages = await prisma.page.findMany();
    const packages = await prisma.package.findMany({
      orderBy: { price: 'asc' }
    });

    // Calculate Total Platform Revenue
    let totalRevenue = 0;
    teachers.forEach(t => {
      t.bookings.forEach(b => {
        if(b.type !== 'trial') totalRevenue += b.amount;
      });
    });

    return NextResponse.json({ teachers, students, pages, packages, totalRevenue });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load admin data" }, { status: 500 });
  }
}

// PUT: Handle Updates (Verify Teacher OR Update Package)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { action, id, data } = body;

    // 1. Verify Teacher
    if (action === 'verify_teacher') {
      const updated = await prisma.teacher.update({
        where: { id },
        data: { isVerified: data.isVerified }
      });
      return NextResponse.json(updated);
    }

    // 2. Update/Create Package
    if (action === 'update_package') {
      const pkg = await prisma.package.upsert({
        where: { id: id || "new" }, // If no ID, create new
        update: { ...data, price: parseInt(data.price) },
        create: { ...data, price: parseInt(data.price) }
      });
      return NextResponse.json(pkg);
    }

    // 3. Save Page (CMS)
    if (action === 'save_page') {
      const page = await prisma.page.upsert({
        where: { slug: data.slug },
        update: { title: data.title, content: data.content },
        create: { slug: data.slug, title: data.title, content: data.content }
      });
      return NextResponse.json(page);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

// DELETE: Remove User or Package
export async function DELETE(req: Request) {
  try {
    const { id, type } = await req.json();

    if (type === 'teacher') {
      await prisma.booking.deleteMany({ where: { teacherId: id } });
      await prisma.course.deleteMany({ where: { teacherId: id } });
      await prisma.teacher.delete({ where: { id } });
    } 
    else if (type === 'student') {
      await prisma.booking.deleteMany({ where: { studentId: id } });
      await prisma.student.delete({ where: { id } });
    }
    else if (type === 'package') {
      await prisma.package.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
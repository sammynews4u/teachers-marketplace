import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; // <--- CRITICAL: Disables caching for this API

// GET: Fetch Everything
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: 'desc' }, include: { bookings: true } });
    const students = await prisma.student.findMany({ orderBy: { createdAt: 'desc' } });
    const pages = await prisma.page.findMany();
    const packages = await prisma.package.findMany({ orderBy: { price: 'asc' } });
    const faqs = await prisma.fAQ.findMany({ orderBy: { createdAt: 'asc' } });

    // Calculate Revenue
    let totalRevenue = 0;
    teachers.forEach(t => {
      t.bookings.forEach(b => {
        if(b.type !== 'trial') totalRevenue += b.amount;
      });
    });

    return NextResponse.json({ 
      teachers: teachers || [], 
      students: students || [], 
      pages: pages || [], 
      packages: packages || [], 
      faqs: faqs || [],
      totalRevenue 
    });

  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: "Failed to load admin data" }, { status: 500 });
  }
}

// PUT: Handle Updates
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { action, id, data } = body;

    // 1. Verify Teacher
    if (action === 'verify_teacher') {
      await prisma.teacher.update({ where: { id }, data: { isVerified: data.isVerified } });
    }

    // 2. Update OR Create Package
    if (action === 'update_package') {
      // Check if ID is a valid string and not just "new" or empty
      if (id && id.length > 10) { 
        await prisma.package.update({
          where: { id },
          data: { 
            name: data.name, 
            price: parseInt(data.price), 
            description: data.description, 
            features: data.features 
          }
        });
      } else {
        await prisma.package.create({
          data: { 
            name: data.name, 
            price: parseInt(data.price), 
            description: data.description, 
            features: data.features 
          }
        });
      }
    }

    // 3. Save Page (CMS)
    if (action === 'save_page') {
      await prisma.page.upsert({
        where: { slug: data.slug },
        update: { title: data.title, content: data.content },
        create: { slug: data.slug, title: data.title, content: data.content }
      });
    }

    // 4. Update OR Create FAQ
    if (action === 'update_faq') {
      if (id && id.length > 10) {
        await prisma.fAQ.update({ 
          where: { id }, 
          data: { question: data.question, answer: data.answer } 
        });
      } else {
        await prisma.fAQ.create({ 
          data: { question: data.question, answer: data.answer } 
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Put Error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

// DELETE: Remove Items
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
    else if (type === 'package') await prisma.package.delete({ where: { id } });
    else if (type === 'faq') await prisma.fAQ.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
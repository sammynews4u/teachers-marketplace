import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch Everything (Teachers, Students, Pages, Packages, Stats, AND FAQs)
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { createdAt: 'desc' },
      include: { bookings: true }
    });
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const pages = await prisma.page.findMany();
    
    const packages = await prisma.package.findMany({
      orderBy: { price: 'asc' }
    });

    // --- NEW: Fetch FAQs ---
    const faqs = await prisma.fAQ.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // Calculate Total Revenue
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
      faqs: faqs || [], // Return FAQs
      totalRevenue 
    });

  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: "Failed to load admin data" }, { status: 500 });
  }
}

// PUT: Handle Updates (Verify, Packages, Pages, AND FAQs)
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

    // 2. Update OR Create Package
    if (action === 'update_package') {
      if (id && id !== "") {
        const pkg = await prisma.package.update({
          where: { id },
          data: { 
            name: data.name,
            price: parseInt(data.price),
            description: data.description,
            features: data.features
          }
        });
        return NextResponse.json(pkg);
      } else {
        const pkg = await prisma.package.create({
          data: { 
            name: data.name,
            price: parseInt(data.price),
            description: data.description,
            features: data.features
          }
        });
        return NextResponse.json(pkg);
      }
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

    // 4. Update OR Create FAQ (--- NEW ---)
    if (action === 'update_faq') {
      if (id && id !== "") {
        const faq = await prisma.fAQ.update({
          where: { id },
          data: { question: data.question, answer: data.answer }
        });
        return NextResponse.json(faq);
      } else {
        const faq = await prisma.fAQ.create({
          data: { question: data.question, answer: data.answer }
        });
        return NextResponse.json(faq);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

// DELETE: Remove User, Package, or FAQ
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
    // --- NEW: Delete FAQ ---
    else if (type === 'faq') {
      await prisma.fAQ.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
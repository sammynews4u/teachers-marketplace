import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic'; 

const prisma = new PrismaClient();

// GET: Fetch Everything + content + settings + stats
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: 'desc' }, include: { bookings: true } });
    const students = await prisma.student.findMany({ orderBy: { createdAt: 'desc' } });
    const pages = await prisma.page.findMany();
    const packages = await prisma.package.findMany({ orderBy: { price: 'asc' } });
    const faqs = await prisma.fAQ.findMany({ orderBy: { createdAt: 'asc' } });
    
    // Content Moderation Data
    const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' }, include: { teacher: { select: { name: true } } } });
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' }, include: { teacher: { select: { name: true } }, student: { select: { name: true } } } });

    // Fetch Transactions
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: { select: { name: true, email: true } },
        student: { select: { name: true, email: true } },
        course: { select: { title: true } }
      }
    });

    // Fetch Settings (Create default if missing)
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { commissionRate: 10, supportEmail: "support@teachersb.com" }
      });
    }

    // Calculate Revenue & Profit
    let totalRevenue = 0;
    let platformProfit = 0;
    
    bookings.forEach(b => {
      if(b.type !== 'trial' && !b.isRefunded) {
        totalRevenue += b.amount;
        // Calculate profit based on commission %
        platformProfit += (b.amount * (settings?.commissionRate || 10)) / 100;
      }
    });

    return NextResponse.json({ 
      teachers: teachers || [], 
      students: students || [], 
      pages: pages || [], 
      packages: packages || [], 
      faqs: faqs || [],
      bookings: bookings || [],
      courses: courses || [], 
      reviews: reviews || [], 
      settings,
      totalRevenue,
      platformProfit
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

// PUT: Handle Updates (Suspend, Refund, Settings, Verify, Content)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { action, id, data } = body;

    // 1. Verify Teacher
    if (action === 'verify_teacher') {
      await prisma.teacher.update({ where: { id }, data: { isVerified: data.isVerified } });
    }
    // 2. Suspend/Unsuspend User
    if (action === 'toggle_suspend') {
      if (data.type === 'teacher') await prisma.teacher.update({ where: { id }, data: { isSuspended: data.status } });
      else await prisma.student.update({ where: { id }, data: { isSuspended: data.status } });
    }
    // 3. Update Global Settings
    if (action === 'update_settings') {
      const first = await prisma.systemSettings.findFirst();
      if(first) await prisma.systemSettings.update({ where: { id: first.id }, data: { commissionRate: parseInt(data.commissionRate), supportEmail: data.supportEmail, maintenanceMode: data.maintenanceMode } });
    }
    // 4. Refund Booking
    if (action === 'refund_booking') {
      await prisma.booking.update({ where: { id }, data: { isRefunded: true, status: 'refunded' } });
    }
    // 5. Update Packages
    if (action === 'update_package') {
      if (id && id.length > 5) await prisma.package.update({ where: { id }, data: { ...data, price: parseInt(data.price) } });
      else await prisma.package.create({ data: { ...data, price: parseInt(data.price) } });
    }
    // 6. Update Pages
    if (action === 'save_page') {
      await prisma.page.upsert({ where: { slug: data.slug }, update: data, create: data });
    }
    // 7. Update FAQs
    if (action === 'update_faq') {
      if (id && id.length > 5) await prisma.fAQ.update({ where: { id }, data });
      else await prisma.fAQ.create({ data });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

// DELETE: Remove Items (Deep Clean)
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
    
    // Content Deletion
    else if (type === 'course') {
      await prisma.booking.deleteMany({ where: { courseId: id } });
      await prisma.course.delete({ where: { id } });
    }
    else if (type === 'review') {
      await prisma.review.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
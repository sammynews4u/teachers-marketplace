import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic'; 

const prisma = new PrismaClient();

export async function GET() {
  console.log("Admin API: Starting fetch...");

  try {
    // Run all queries in parallel. If one fails, others still finish.
    const results = await Promise.allSettled([
      prisma.teacher.findMany({ orderBy: { createdAt: 'desc' }, include: { bookings: true } }),
      prisma.student.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.page.findMany(),
      prisma.package.findMany({ orderBy: { price: 'asc' } }),
      prisma.fAQ.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: { select: { name: true, email: true } },
          student: { select: { name: true, email: true } },
          course: { select: { title: true } }
        }
      }),
      // Try to fetch settings, handle failure gracefully inside
      prisma.systemSettings.findFirst()
    ]);

    // Extract results (Default to empty array if failed)
    const teachers = results[0].status === 'fulfilled' ? results[0].value : [];
    const students = results[1].status === 'fulfilled' ? results[1].value : [];
    const pages = results[2].status === 'fulfilled' ? results[2].value : [];
    const packages = results[3].status === 'fulfilled' ? results[3].value : [];
    const faqs = results[4].status === 'fulfilled' ? results[4].value : [];
    const bookings = results[5].status === 'fulfilled' ? results[5].value : [];
    let settings = results[6].status === 'fulfilled' ? results[6].value : null;

    // Log errors if any
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`Query ${i} failed:`, r.reason);
    });

    // Handle Settings (Create Default if missing)
    if (!settings) {
      try {
        // Double check if table exists by trying to create
        settings = await prisma.systemSettings.create({
          data: { commissionRate: 10, supportEmail: "support@platform.com" }
        });
      } catch (e) {
        console.error("Failed to create default settings:", e);
        settings = { commissionRate: 10, maintenanceMode: false, supportEmail: "error@setup.com" }; // Fallback
      }
    }

    // Content Moderation (Courses & Reviews)
    const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' }, include: { teacher: { select: { name: true } } } }).catch(() => []);
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' }, include: { teacher: { select: { name: true } }, student: { select: { name: true } } } }).catch(() => []);

    // Calculate Stats
    let totalRevenue = 0;
    let platformProfit = 0;
    
    // @ts-ignore
    bookings.forEach(b => {
      if(b.type !== 'trial' && !b.isRefunded) {
        totalRevenue += b.amount;
        // @ts-ignore
        platformProfit += (b.amount * (settings?.commissionRate || 10)) / 100;
      }
    });

    return NextResponse.json({ 
      teachers, students, pages, packages, faqs, bookings, 
      courses, reviews, settings, totalRevenue, platformProfit 
    });

  } catch (error) {
    console.error("CRITICAL ADMIN API ERROR:", error);
    // Return empty structure instead of 500 error so dashboard doesn't break
    return NextResponse.json({ 
      teachers: [], students: [], pages: [], packages: [], faqs: [], bookings: [], 
      courses: [], reviews: [], settings: {}, totalRevenue: 0 
    });
  }
}

// PUT: Handle Updates
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { action, id, data } = body;

    if (action === 'verify_teacher') await prisma.teacher.update({ where: { id }, data: { isVerified: data.isVerified } });
    
    if (action === 'toggle_suspend') {
      if (data.type === 'teacher') await prisma.teacher.update({ where: { id }, data: { isSuspended: data.status } });
      else await prisma.student.update({ where: { id }, data: { isSuspended: data.status } });
    }

    if (action === 'update_settings') {
      const first = await prisma.systemSettings.findFirst();
      if(first) await prisma.systemSettings.update({ where: { id: first.id }, data: { commissionRate: parseInt(data.commissionRate), supportEmail: data.supportEmail, maintenanceMode: data.maintenanceMode } });
    }

    if (action === 'refund_booking') await prisma.booking.update({ where: { id }, data: { isRefunded: true, status: 'refunded' } });

    if (action === 'update_package') {
      if (id && id.length > 5) await prisma.package.update({ where: { id }, data: { ...data, price: parseInt(data.price) } });
      else await prisma.package.create({ data: { ...data, price: parseInt(data.price) } });
    }

    if (action === 'save_page') await prisma.page.upsert({ where: { slug: data.slug }, update: data, create: data });

    if (action === 'update_faq') {
      if (id && id.length > 5) await prisma.fAQ.update({ where: { id }, data });
      else await prisma.fAQ.create({ data });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
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
    else if (type === 'course') {
      await prisma.booking.deleteMany({ where: { courseId: id } });
      await prisma.course.delete({ where: { id } });
    }
    else if (type === 'review') await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic'; // Prevent caching so new teachers show up instantly

const prisma = new PrismaClient();

// POST: Create Teacher (Registration)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, subject, location, hourlyRate, image } = body;

    if (!name || !email || !password || !subject || !location || !hourlyRate) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await prisma.teacher.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 });

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password,
        subject,
        location,
        hourlyRate: parseInt(hourlyRate),
        image: image || "", 
        isVerified: false, 
        // Default ranking/plan
        plan: 'free',
        ranking: 0
      },
    });

    return NextResponse.json({ success: true, teacher });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating teacher' }, { status: 500 });
  }
}

// GET: Fetch Teachers with Filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const location = searchParams.get('location');
    const maxPrice = searchParams.get('maxPrice');

    // Build Dynamic Filter
    const where: any = {};

    // Only filter by subject if user typed something
    if (subject && subject.trim() !== '') {
      where.subject = { contains: subject.trim(), mode: 'insensitive' };
    }

    // Only filter by location if user typed something
    if (location && location.trim() !== '') {
      where.location = { contains: location.trim(), mode: 'insensitive' };
    }

    // Only filter by price if it's a valid number
    if (maxPrice && !isNaN(parseInt(maxPrice))) {
      where.hourlyRate = { lte: parseInt(maxPrice) }; // lte = Less Than or Equal
    }

    const teachers = await prisma.teacher.findMany({
      where,
      orderBy: [
        { ranking: 'desc' },    // 1. Gold/Silver Packages appear first
        { isVerified: 'desc' }, // 2. Verified teachers next
        { rating: 'desc' },     // 3. Highest rated next
        { createdAt: 'desc' }   // 4. Newest teachers last
      ],
      include: {
        bookings: true // Needed for frontend stats
      }
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Teacher Fetch Error:", error);
    return NextResponse.json({ error: 'Error fetching teachers' }, { status: 500 });
  }
}
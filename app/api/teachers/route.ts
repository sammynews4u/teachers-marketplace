import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      },
    });

    // Send Welcome Email (Optional - requires your email helper)
    // await sendEmail(email, "Welcome", "...");

    return NextResponse.json({ success: true, teacher });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating teacher' }, { status: 500 });
  }
}

// GET: Fetch with Filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const location = searchParams.get('location');
    const maxPrice = searchParams.get('maxPrice');

    // Build the Filter Query
    const where: any = {};

    if (subject && subject !== 'all') {
      // "contains" means searching "Math" finds "Mathematics"
      // mode: 'insensitive' means "math" finds "Math"
      where.subject = { contains: subject, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (maxPrice) {
      where.hourlyRate = { lte: parseInt(maxPrice) }; // lte = Less Than or Equal
    }

    const teachers = await prisma.teacher.findMany({
      where,
      orderBy: [
        { ranking: 'desc' },    // Gold/Silver first
        { isVerified: 'desc' }, // Verified second
        { sales: 'desc' }       // High sales third
      ],
      include: {
        bookings: true
      }
    });

    return NextResponse.json(teachers);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching teachers' }, { status: 500 });
  }
}
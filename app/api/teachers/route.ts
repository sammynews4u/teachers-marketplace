import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, subject, location, hourlyRate, image } = body;

    // Validate
    if (!name || !email || !password || !subject || !location || !hourlyRate) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.teacher.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password, // In a real app, we would encrypt this!
        subject,
        location,
        hourlyRate: parseInt(hourlyRate),
        image: image || "", 
        isVerified: false, 
      },
    });

    return NextResponse.json({ success: true, teacher });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating teacher' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: [
        { ranking: 'desc' },    // 1. Gold/Silver/Bronze come first
        { isVerified: 'desc' }, // 2. Then Verified teachers
        { sales: 'desc' }       // 3. Then Top Sellers
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
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { swychr } from '@/lib/swychr';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');

  if (!reference) return NextResponse.json({ error: "No reference" });

  // 1. Verify with Swychr
  const verification = await swychr.verify(reference);

  if (verification && verification.data.status === 'success') {
    // 2. Update Database
    const booking = await prisma.booking.update({
      where: { reference },
      data: { status: 'success' }
    });

    return NextResponse.json({ success: true, amount: booking.amount });
  }

  return NextResponse.json({ success: false });
}
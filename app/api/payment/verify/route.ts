import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { accountpe } from '@/lib/accountpe';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');

  if (!reference) return NextResponse.json({ success: false });

  // Verify
  const verification = await accountpe.verify(reference);

  if (verification.status) {
    const booking = await prisma.booking.update({
      where: { reference },
      data: { status: 'success' }
    });
    return NextResponse.json({ success: true, amount: booking.amount });
  }

  return NextResponse.json({ success: false });
}
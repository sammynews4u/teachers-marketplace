import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { accountpe } from '@/lib/accountpe';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');

  if (!reference) return NextResponse.json({ success: false });

  // 1. Verify with AccountPe
  const verification = await accountpe.verify(reference);

  if (verification.status) {
    // 2. Find the Transaction
    const booking = await prisma.booking.findFirst({ where: { reference } });
    
    if (booking && booking.status !== 'success') {
        // Mark as paid
        await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'success' }
        });

        // 3. CHECK IF IT IS A PACKAGE UPGRADE
        if (booking.type.startsWith('package_')) {
            const planName = booking.type.split('_')[1]; // extract 'gold' from 'package_gold'
            let rankingScore = 10;
            if (planName === 'silver') rankingScore = 50;
            if (planName === 'gold') rankingScore = 100;

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            // Upgrade Teacher
            await prisma.teacher.update({
                where: { id: booking.teacherId },
                data: {
                    plan: planName,
                    planExpires: expiresAt,
                    ranking: rankingScore
                }
            });
        }
    }

    return NextResponse.json({ success: true, amount: booking?.amount });
  }

  return NextResponse.json({ success: false });
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { teacherId, plan, amount, reference } = await req.json();

    // Determine ranking score based on plan
    let rankingScore = 0;
    let durationDays = 30; // Ads last 30 days

    if (plan === 'bronze') rankingScore = 10;
    if (plan === 'silver') rankingScore = 50;
    if (plan === 'gold') rankingScore = 100;

    // Calculate Expiry Date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // 1. Update Teacher Profile
    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        plan: plan,
        planExpires: expiresAt,
        ranking: rankingScore
      }
    });

    // 2. Log the Transaction (Optional but recommended)
    // You could create a Transaction model later to track this revenue.

    return NextResponse.json({ success: true, teacher });
  } catch (error) {
    return NextResponse.json({ error: "Purchase failed" }, { status: 500 });
  }
}
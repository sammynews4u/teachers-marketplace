import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Get Balance & History
export async function POST(req: Request) {
  try {
    const { teacherId } = await req.json();

    // 1. Get all Income (Paid Bookings)
    const bookings = await prisma.booking.findMany({
      where: { teacherId, status: 'success', type: { not: 'trial' }, isRefunded: false }
    });

    // 2. Get all Payouts
    const payouts = await prisma.payout.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Calculate Math
    const totalEarnings = bookings.reduce((sum, b) => sum + b.amount, 0);
    const totalWithdrawn = payouts.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0);
    const pendingPayouts = payouts.reduce((sum, p) => p.status === 'pending' ? sum + p.amount : sum, 0);
    
    const availableBalance = totalEarnings - totalWithdrawn - pendingPayouts;

    return NextResponse.json({ 
      availableBalance, 
      totalEarnings, 
      payouts 
    });

  } catch (error) {
    return NextResponse.json({ error: "Error fetching wallet" }, { status: 500 });
  }
}

// PUT: Request a Withdrawal
export async function PUT(req: Request) {
  try {
    const { teacherId, amount, bankName, accountNumber, accountName } = await req.json();

    // 1. Update Bank Details
    await prisma.teacher.update({
      where: { id: teacherId },
      data: { bankName, accountNumber, accountName }
    });

    // 2. Create Request
    const payout = await prisma.payout.create({
      data: {
        teacherId,
        amount: parseInt(amount),
        status: 'pending',
        bankDetails: `${bankName} - ${accountNumber} (${accountName})`
      }
    });

    return NextResponse.json({ success: true, payout });

  } catch (error) {
    return NextResponse.json({ error: "Failed to request payout" }, { status: 500 });
  }
}
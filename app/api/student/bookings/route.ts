import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { teacherId, studentId, amount, reference, type, scheduledAt } = await req.json();

    // If it's a trial, we generate a fake reference
    const finalReference = type === 'trial' ? `TRIAL-${Date.now()}` : reference;
    const finalStatus = type === 'trial' ? 'scheduled' : 'success';

    const booking = await prisma.booking.create({
      data: {
        teacherId,
        studentId,
        amount,
        reference: finalReference,
        status: finalStatus,
        type: type || 'paid',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
      }
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 });
  }
}
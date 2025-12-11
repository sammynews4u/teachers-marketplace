import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { accountpe } from '@/lib/accountpe';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { teacherId, plan, amount, reference: oldRef } = await req.json();

    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    // 1. Generate New Reference
    const reference = `PKG-${Date.now()}`;

    // 2. Create a "Holding" Booking Record 
    // (This allows the Verify API to find this transaction later)
    // We use type = "package_gold" etc to know it's a package upgrade
    await prisma.booking.create({
      data: {
        teacherId,
        studentId: teacherId, // Self-booking for record keeping
        amount: parseInt(amount),
        reference,
        status: 'pending',
        type: `package_${plan}`, // e.g., package_gold
      }
    });

    // 3. Initialize AccountPe
    const paymentData = await accountpe.initialize({
      name: teacher.name,
      email: teacher.email,
      amount: parseInt(amount),
      ref: reference,
      mobile: "0000000000"
    });

    if (paymentData.status && paymentData.paymentUrl) {
      return NextResponse.json({ success: true, paymentUrl: paymentData.paymentUrl });
    } else {
      return NextResponse.json({ error: "Gateway Failed" }, { status: 502 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Purchase failed" }, { status: 500 });
  }
}
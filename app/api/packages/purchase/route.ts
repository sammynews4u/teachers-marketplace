import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { accountpe } from '@/lib/accountpe';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { teacherId, plan, amount } = await req.json();

    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const reference = `PKG-${Date.now()}`;

    // 1. Create Pending Booking
    await prisma.booking.create({
      data: {
        teacherId,
        studentId: teacherId, 
        amount: parseInt(amount),
        reference,
        status: 'pending',
        type: `package_${plan}`,
      }
    });

    // 2. Init AccountPe
    const paymentData = await accountpe.initialize({
      name: teacher.name,
      email: teacher.email,
      amount: parseInt(amount),
      ref: reference,
      mobile: "08000000000"
    });

    if (paymentData.status && paymentData.paymentUrl) {
      return NextResponse.json({ success: true, paymentUrl: paymentData.paymentUrl });
    } else {
      // RETURN THE REAL REASON
      return NextResponse.json({ success: false, error: paymentData.error });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Server Error" });
  }
}
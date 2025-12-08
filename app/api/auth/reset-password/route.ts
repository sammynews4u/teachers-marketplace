import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, type, newPassword } = await req.json();

    // Find user with valid token and expiry
    let user;
    const query = {
      where: { 
        resetToken: token,
        resetTokenExpiry: { gt: new Date() } // Expiry must be in the future
      },
      data: {
        password: newPassword, // In real app, hash this!
        resetToken: null,
        resetTokenExpiry: null
      }
    };

    if (type === 'teacher') {
      // @ts-ignore
      user = await prisma.teacher.updateMany(query); // updateMany allows checking multiple fields
      // Fix: To be safe with unique constraints, we verify first then update by ID ideally, 
      // but updateMany works for token verification logic simply here.
      
      // Let's use a simpler findFirst then update approach for safety
      const found = await prisma.teacher.findFirst({
        where: { resetToken: token, resetTokenExpiry: { gt: new Date() } }
      });
      if(found) await prisma.teacher.update({ where: { id: found.id }, data: query.data });
      user = found;

    } else {
      const found = await prisma.student.findFirst({
        where: { resetToken: token, resetTokenExpiry: { gt: new Date() } }
      });
      if(found) await prisma.student.update({ where: { id: found.id }, data: query.data });
      user = found;
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
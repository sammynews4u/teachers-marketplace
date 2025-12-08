import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/lib/email'; // Uses the Resend setup we made earlier
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json(); // type = 'teacher' or 'student'

    // 1. Generate Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    let user;

    // 2. Find and Update User
    if (type === 'teacher') {
      user = await prisma.teacher.update({
        where: { email },
        data: { resetToken, resetTokenExpiry }
      }).catch(() => null);
    } else {
      user = await prisma.student.update({
        where: { email },
        data: { resetToken, resetTokenExpiry }
      }).catch(() => null);
    }

    if (!user) {
      // Security: Don't tell if user exists or not, just say "If account exists..."
      return NextResponse.json({ success: true });
    }

    // 3. Send Email
    const resetLink = `https://teachers-marketplace.vercel.app/reset-password?token=${resetToken}&type=${type}`;
    
    await sendEmail(
      email,
      "Reset Your Password",
      `<p>You requested a password reset.</p>
       <p>Click the link below to set a new password:</p>
       <a href="${resetLink}">${resetLink}</a>
       <p>This link expires in 1 hour.</p>`
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
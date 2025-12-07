import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Check if email exists
    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email exists' }, { status: 400 });

    // Create Student (ONCE)
    const student = await prisma.student.create({
      data: { name, email, password }
    });

    // Send Welcome Email
    await sendEmail(
      email,
      "Welcome to TeachersB - Student Account",
      `<h1>Hi ${name}!</h1>
       <p>Your student account has been created successfully.</p>
       <p>You can now browse teachers and book your first lesson.</p>
       <br/>
       <a href="https://teachers-marketplace.vercel.app/teachers">Find a Teacher</a>`
    );

    return NextResponse.json({ success: true, student });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Check if email exists
    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email exists' }, { status: 400 });

    const student = await prisma.student.create({
      data: { name, email, password }
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
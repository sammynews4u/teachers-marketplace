import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const teacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (!teacher || teacher.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Return the teacher ID so the frontend can save it
    return NextResponse.json({ success: true, teacherId: teacher.id });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
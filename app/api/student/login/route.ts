import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const student = await prisma.student.findUnique({ where: { email } });

  if (!student || student.password !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  return NextResponse.json({ success: true, studentId: student.id, name: student.name });
}
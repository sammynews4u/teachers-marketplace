import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(faqs);
  } catch (error) {
    return NextResponse.json([]);
  }
}
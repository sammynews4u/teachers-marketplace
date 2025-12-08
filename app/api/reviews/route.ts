import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Submit a Review
export async function POST(req: Request) {
  try {
    const { teacherId, studentId, rating, comment } = await req.json();

    // 1. Create Review
    await prisma.review.create({
      data: {
        teacherId,
        studentId,
        rating: parseInt(rating),
        comment
      }
    });

    // 2. Recalculate Teacher Average
    const aggregations = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { teacherId }
    });

    const newRating = aggregations._avg.rating || 0;

    // 3. Update Teacher Profile
    await prisma.teacher.update({
      where: { id: teacherId },
      data: { rating: newRating }
    });

    return NextResponse.json({ success: true, newRating });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

// GET: Fetch Reviews for a Teacher
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacherId');

  if(!teacherId) return NextResponse.json([]);

  const reviews = await prisma.review.findMany({
    where: { teacherId },
    include: { student: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(reviews);
}
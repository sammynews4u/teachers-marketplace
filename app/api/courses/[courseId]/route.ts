import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch Single Course (Full Details)
export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' }, include: { resources: true } } }
        }
      }
    });
    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load course" }, { status: 500 });
  }
}

// PUT: Update Course Details (Overview, Outcomes, etc)
export async function PUT(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const body = await req.json();
    // Remove ID/TeacherId from body to prevent overwrite errors
    delete body.id;
    delete body.teacherId;
    delete body.modules; // Modules are handled via the chapters API

    const updated = await prisma.course.update({
      where: { id: params.courseId },
      data: {
        ...body,
        // Ensure dates are valid objects
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
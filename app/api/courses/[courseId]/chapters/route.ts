import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Create Module or Lesson
export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { type, title, moduleId, videoUrl, description, resources } = await req.json();

    // 1. Create Module
    if (type === 'module') {
      const lastModule = await prisma.module.findFirst({
        where: { courseId: params.courseId },
        orderBy: { order: 'desc' }
      });
      const newOrder = lastModule ? lastModule.order + 1 : 1;

      const module = await prisma.module.create({
        data: { title, courseId: params.courseId, order: newOrder }
      });
      return NextResponse.json(module);
    }

    // 2. Create Lesson
    if (type === 'lesson') {
      const lastLesson = await prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: 'desc' }
      });
      const newOrder = lastLesson ? lastLesson.order + 1 : 1;

      const lesson = await prisma.lesson.create({
        data: {
          title,
          moduleId,
          videoUrl,
          description,
          order: newOrder,
          resources: {
            createMany: { data: resources || [] } // resources = [{name: 'PDF', url: '...'}]
          }
        }
      });
      return NextResponse.json(lesson);
    }

    return NextResponse.json({ error: "Invalid Type" }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}

// GET: Fetch Full Course Structure
export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: { resources: true }
            }
          }
        }
      }
    });
    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
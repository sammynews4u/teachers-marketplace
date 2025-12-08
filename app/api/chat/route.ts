import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Send a Message
export async function POST(req: Request) {
  try {
    const { senderId, senderType, receiverId, content } = await req.json();

    // 1. Determine IDs based on who is sending
    const teacherId = senderType === 'teacher' ? senderId : receiverId;
    const studentId = senderType === 'student' ? senderId : receiverId;

    // 2. Find or Create Conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        teacherId_studentId: { teacherId, studentId }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { teacherId, studentId }
      });
    }

    // 3. Create Message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        senderType,
        content
      }
    });

    // 4. Update Conversation timestamp (to show latest at top)
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// GET: Fetch Conversations for a User
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type'); // "teacher" or "student"

  if (!userId || !type) return NextResponse.json([]);

  const where = type === 'teacher' ? { teacherId: userId } : { studentId: userId };
  const include = type === 'teacher' 
    ? { student: { select: { id: true, name: true, image: true } }, messages: { orderBy: { createdAt: 'asc' } } }
    : { teacher: { select: { id: true, name: true, image: true } }, messages: { orderBy: { createdAt: 'asc' } } };

  const conversations = await prisma.conversation.findMany({
    where,
    include,
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json(conversations);
}
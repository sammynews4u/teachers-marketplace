import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This forces the code to run fresh every time (no caching)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Delete All FAQs
    const deletedFAQs = await prisma.fAQ.deleteMany({});
    
    // 2. Delete All Packages
    const deletedPackages = await prisma.package.deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${deletedFAQs.count} FAQs and ${deletedPackages.count} Packages from the database.` 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete data", details: String(error) }, { status: 500 });
  }
}
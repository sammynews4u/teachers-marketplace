import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    
    // Check against the Vercel Environment Variable
    if (password === process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid Password" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
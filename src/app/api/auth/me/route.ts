import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 });
  }

  return NextResponse.json({ code: 200, data: user });
}

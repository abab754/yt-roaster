import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const historyStats = await request.json();

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { historyStats: historyStats as Prisma.InputJsonValue },
    create: {
      userId: session.user.id,
      data: {},
      historyStats: historyStats as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ ok: true });
}

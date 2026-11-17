import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateRoast } from '@/lib/roast';
import type { UserProfile, HistoryStats } from '@/lib/types';

const prisma = new PrismaClient();

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cached = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!cached?.data) {
    return NextResponse.json(
      { error: 'No YouTube profile found. Fetch your data first.' },
      { status: 400 },
    );
  }

  const profile = cached.data as unknown as UserProfile;
  const historyStats = cached.historyStats as unknown as HistoryStats | null;

  const roast = await generateRoast(profile, historyStats);

  return NextResponse.json(roast);
}

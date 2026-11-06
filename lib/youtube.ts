import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getYouTubeClient(userId: string) {
  // Look up the user's Google account tokens from the DB
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
  });

  if (!account?.access_token) {
    throw new Error('No Google account found for user');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : null,
  });

  // When tokens refresh, update the DB
  oauth2Client.on('tokens', async (newTokens) => {
    await prisma.account.update({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: account.providerAccountId,
        },
      },
      data: {
        access_token: newTokens.access_token ?? account.access_token,
        refresh_token: newTokens.refresh_token ?? account.refresh_token,
        expires_at: newTokens.expiry_date
          ? Math.floor(newTokens.expiry_date / 1000)
          : account.expires_at,
      },
    });
  });

  return google.youtube({ version: 'v3', auth: oauth2Client });
}

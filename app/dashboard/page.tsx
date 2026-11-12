import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { connection } from 'next/server';
import ProfileStats from './profile-stats';

export const instant = false;

export default async function Dashboard() {
  await connection();
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const { name, email, image } = session.user;

  return (
    <div className="w-full px-6 py-8 sm:px-10 lg:px-16">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {image && (
            <Image
              src={image}
              alt={name ?? 'Avatar'}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <h1 className="text-xl font-bold">{name}</h1>
            <p className="text-sm text-zinc-500">{email}</p>
          </div>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <button
            type="submit"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Stats */}
      <ProfileStats />

      {/* Takeout link */}
      <div className="mt-6">
        <Link
          href="/dashboard/takeout"
          className="inline-block rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
        >
          Upload watch history for a deeper roast
        </Link>
      </div>
    </div>
  );
}

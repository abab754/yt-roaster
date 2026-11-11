'use client';

import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';

function BarChart({
  items,
  maxCount,
}: {
  items: { label: string; count: number }[];
  maxCount: number;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="group">
          <div className="mb-1 flex justify-between text-sm">
            <span className="truncate pr-2 transition-colors group-hover:text-white">
              {item.label}
            </span>
            <span className="shrink-0 text-zinc-500">{item.count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-700 ease-out"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-zinc-800/50 p-4 text-center transition-colors hover:bg-zinc-800">
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

export default function ProfileStats() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex w-full flex-col items-center gap-3 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-red-500" />
        <p className="animate-pulse text-zinc-500">
          Analyzing your YouTube taste...
        </p>
      </div>
    );
  }

  if (error) {
    return <p className="w-full text-center text-red-500">Error: {error}</p>;
  }

  if (!profile) return null;

  const { stats } = profile;
  const topChannelMax = stats.topChannels[0]?.count ?? 1;
  const topCategoryMax = stats.categoryBreakdown[0]?.count ?? 1;

  return (
    <div className="w-full space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard value={stats.totalLiked} label="Liked Videos" />
        <StatCard value={stats.totalSubscriptions} label="Subscriptions" />
        <StatCard value={stats.totalPlaylists} label="Playlists" />
        <StatCard
          value={`${Math.round(stats.avgVideoDurationSeconds / 60)}m`}
          label="Avg Duration"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Channels */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="mb-4 text-lg font-semibold">Top Channels</h3>
          <BarChart
            items={stats.topChannels.map((ch) => ({
              label: ch.name,
              count: ch.count,
            }))}
            maxCount={topChannelMax}
          />
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="mb-4 text-lg font-semibold">Categories</h3>
          <BarChart
            items={stats.categoryBreakdown.map((cat) => ({
              label: cat.category,
              count: cat.count,
            }))}
            maxCount={topCategoryMax}
          />
        </div>
      </div>

      {/* Shorts vs Long */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="mb-3 text-lg font-semibold">Shorts vs Long-Form</h3>
        <div className="flex h-6 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-medium transition-all duration-700"
            style={{
              width: `${(stats.shortsVsLongForm.shorts / Math.max(stats.totalLiked, 1)) * 100}%`,
            }}
          >
            {stats.shortsVsLongForm.shorts > 0 &&
              `${stats.shortsVsLongForm.shorts}`}
          </div>
          <div
            className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 text-xs font-medium transition-all duration-700"
            style={{
              width: `${(stats.shortsVsLongForm.long / Math.max(stats.totalLiked, 1)) * 100}%`,
            }}
          >
            {stats.shortsVsLongForm.long > 0 &&
              `${stats.shortsVsLongForm.long}`}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>Shorts ({stats.shortsVsLongForm.shorts})</span>
          <span>Long-form ({stats.shortsVsLongForm.long})</span>
        </div>
      </div>

      {/* Raw JSON Toggle */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
        >
          {showRaw ? 'Hide' : 'Show'} Raw JSON
        </button>
        {showRaw && (
          <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-400">
            {JSON.stringify(profile, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

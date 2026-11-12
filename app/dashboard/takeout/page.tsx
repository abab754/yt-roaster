'use client';

import { useState } from 'react';
import { parseTakeout } from '@/lib/takeout';
import { computeHistoryStats } from '@/lib/history-stats';
import type { HistoryStats } from '@/lib/types';

export default function TakeoutPage() {
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setStats(null);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        const entries = parseTakeout(raw);
        if (entries.length === 0) {
          setError('No watch history entries found in this file.');
          return;
        }
        const computed = computeHistoryStats(entries);
        setStats(computed);
        // Save computed stats to server (never raw history)
        fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(computed),
        });
      } catch (err) {
        setError(
          err instanceof SyntaxError
            ? 'This file is not valid JSON. Make sure you exported as JSON, not HTML.'
            : err instanceof Error
              ? err.message
              : 'Failed to parse file.',
        );
      } finally {
        setParsing(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setParsing(false);
    };
    reader.readAsText(file);
  }

  return (
    <div className="w-full px-6 py-8 sm:px-10 lg:px-16">
      <h1 className="mb-2 text-2xl font-bold">Roast Me Harder</h1>
      <p className="mb-6 text-zinc-400">
        Upload your YouTube watch history from Google Takeout for a deeper
        roast. Your raw history never leaves your browser — only the computed
        stats are used.
      </p>

      {/* Instructions */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="mb-3 font-semibold">How to export your watch history</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-400">
          <li>
            Go to{' '}
            <a
              href="https://takeout.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              takeout.google.com
            </a>
          </li>
          <li>Click &quot;Deselect all&quot;</li>
          <li>
            Scroll down and select only &quot;YouTube and YouTube Music&quot;
          </li>
          <li>
            Click &quot;All YouTube data included&quot; → select only
            &quot;history&quot;
          </li>
          <li>
            Click &quot;Multiple formats&quot; → change History from HTML to{' '}
            <strong>JSON</strong>
          </li>
          <li>Click &quot;Next step&quot; → &quot;Create export&quot;</li>
          <li>
            Wait for the email, download the zip, and find{' '}
            <code>watch-history.json</code>
          </li>
        </ol>
      </div>

      {/* Upload */}
      <div className="mb-6">
        <label className="inline-block cursor-pointer rounded-full bg-zinc-800 px-6 py-3 text-sm font-medium transition hover:bg-zinc-700">
          {parsing ? 'Parsing...' : 'Upload watch-history.json'}
          <input
            type="file"
            accept=".json"
            onChange={handleFile}
            disabled={parsing}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="mb-6 text-red-500">{error}</p>}

      {/* Results */}
      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              value={stats.totalWatched.toLocaleString()}
              label="Videos Watched"
            />
            <StatCard
              value={`${stats.estimatedHours.toLocaleString()}h`}
              label="Estimated Hours"
            />
            <StatCard
              value={`${stats.lateNightPercent}%`}
              label="Late Night (12-5am)"
            />
            <StatCard
              value={stats.longestBingeStreak.toString()}
              label="Longest Binge Streak"
            />
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="mb-4 text-lg font-semibold">
              Most Watched Channels
            </h3>
            <div className="space-y-2">
              {stats.topWatchedChannels.map((ch) => (
                <div key={ch.name} className="group">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate pr-2 transition-colors group-hover:text-white">
                      {ch.name}
                    </span>
                    <span className="shrink-0 text-zinc-500">{ch.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700 ease-out"
                      style={{
                        width: `${(ch.count / (stats.topWatchedChannels[0]?.count ?? 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-zinc-800/50 p-4 text-center transition-colors hover:bg-zinc-800">
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

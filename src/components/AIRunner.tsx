import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Sparkles, Loader2, Clock, Coins, Zap, CheckCircle } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  body: string;
}

const TONES = ['neutral', 'professional', 'casual', 'academic'] as const;
const LENGTHS = ['short', 'medium', 'long'] as const;

export default function AIRunner() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [tone, setTone] = useState<(typeof TONES)[number]>('professional');
  const [length, setLength] = useState<(typeof LENGTHS)[number]>('medium');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ output: string; latencyMs: number; tokensAwarded: number; totalTokenBalance: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listContent().then((data) => {
      setContents(data.items);
      if (data.items.length > 0) setSelectedId(data.items[0].id);
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load content'));
  }, []);

  async function handleRun() {
    if (!selectedId) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.summarize(selectedId, { tone, length });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setRunning(false);
    }
  }

  const selected = contents.find((c) => c.id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label">Summarization Engine</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink-900">AI Runner</h1>
        <p className="mt-2 text-sm text-ink-600">Select content, choose your parameters, and run a mock AI summarization. Each successful run earns 5 tokens.</p>
      </div>

      {contents.length === 0 && !error && (
        <div className="card p-8 text-center">
          <p className="text-sm text-ink-500">No content available yet.</p>
          <p className="mt-1 text-sm text-ink-400">Create content first from the Content page, then come back to run AI.</p>
        </div>
      )}

      {contents.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configuration */}
          <div className="card space-y-5 p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Select Content</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="input-field"
              >
                {contents.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {selected && (
              <div className="rounded-md border border-paper-300 bg-paper-200/50 p-4">
                <p className="section-label mb-1.5">Source Text</p>
                <p className="text-sm leading-relaxed text-ink-600 line-clamp-4">{selected.body}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as typeof tone)}
                  className="input-field"
                >
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value as typeof length)}
                  className="input-field"
                >
                  {LENGTHS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleRun}
              disabled={running || !selectedId}
              className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"
            >
              {running ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              {running ? 'Running…' : 'Run Summarization'}
            </button>
          </div>

          {/* Result */}
          <div className="card p-6">
            <div className="flex items-center gap-2 border-b border-paper-300 pb-4">
              <Sparkles size={18} className="text-forest-500" />
              <h2 className="font-serif text-lg font-semibold text-ink-900">AI Output</h2>
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-clay-400/40 bg-clay-400/10 p-3 text-sm text-clay-500">{error}</div>
            )}

            {!error && !result && !running && (
              <div className="flex h-48 items-center justify-center text-sm text-ink-400">
                Results will appear here after running.
              </div>
            )}

            {running && (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="animate-spin text-forest-500" size={28} />
              </div>
            )}

            {result && !running && (
              <div className="mt-4 space-y-5">
                <div className="flex items-start gap-2">
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-forest-500" />
                  <p className="text-sm leading-relaxed text-ink-800">{result.output}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 border-t border-paper-300 pt-4">
                  <div>
                    <div className="flex items-center gap-1.5 section-label">
                      <Clock size={12} /> Latency
                    </div>
                    <p className="mt-1 font-mono text-lg font-semibold text-ink-900">{result.latencyMs}<span className="text-xs font-normal text-ink-400">ms</span></p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 section-label">
                      <Coins size={12} /> Earned
                    </div>
                    <p className="mt-1 font-mono text-lg font-semibold text-forest-600">+{result.tokensAwarded}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 section-label">
                      <Coins size={12} /> Balance
                    </div>
                    <p className="mt-1 font-mono text-lg font-semibold text-ink-900">{result.totalTokenBalance}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

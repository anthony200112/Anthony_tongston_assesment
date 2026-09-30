import { api } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { Link } from 'react-router-dom';
import { FileText, Sparkles, Coins, ArrowRight, TrendingUp } from 'lucide-react';

export default function Home() {
  const { data: balanceData } = useApi(() => api.getBalance(), []);
  const { data: contentData } = useApi(() => api.listContent(), []);
  const { data: historyData } = useApi(() => api.getHistory(), []);

  const balance = balanceData?.balance ?? 0;
  const contentCount = contentData?.total ?? 0;
  const history = historyData?.items ?? [];
  const recentEarned = history.filter((t) => t.amount > 0).slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Hero — editorial, asymmetric, no gradients */}
      <section className="grid gap-8 pt-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="section-label">Tokenized AI Module</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
            Create content.<br />
            Run AI.<br />
            <span className="text-forest-500">Earn tokens.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600">
            Tongston T-World is a content platform where every AI summarization
            rewards you with tokens. Convert them to mock on-chain assets and
            track every movement on an immutable ledger.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/content" className="btn-primary inline-flex items-center gap-2">
              Browse Content <ArrowRight size={16} />
            </Link>
            <Link to="/ai" className="btn-secondary inline-flex items-center gap-2">
              <Sparkles size={16} /> Run AI
            </Link>
          </div>
        </div>

        {/* Balance highlight card */}
        <div className="lg:col-span-5">
          <div className="card h-full p-6">
            <p className="section-label">Your Balance</p>
            <p className="stat-number mt-3 text-5xl">{balance}</p>
            <p className="mt-1 text-sm text-ink-500">T-World Tokens (TWD)</p>
            <div className="mt-6 border-t border-paper-300 pt-4">
              <Link to="/tokens" className="inline-flex items-center gap-1 text-sm font-medium text-forest-600 hover:text-forest-700">
                Go to token dashboard <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row — bordered, flat, no gradient cards */}
      <section className="grid gap-4 border-y border-paper-300 py-8 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 section-label">
            <Coins size={14} /> Token Balance
          </div>
          <p className="stat-number mt-2">{balance}</p>
          <Link to="/tokens" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-forest-600 hover:text-forest-700">
            View dashboard <ArrowRight size={11} />
          </Link>
        </div>
        <div className="sm:border-l sm:border-paper-300 sm:pl-6">
          <div className="flex items-center gap-2 section-label">
            <FileText size={14} /> Content Items
          </div>
          <p className="stat-number mt-2">{contentCount}</p>
          <Link to="/content" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-forest-600 hover:text-forest-700">
            Browse content <ArrowRight size={11} />
          </Link>
        </div>
        <div className="sm:border-l sm:border-paper-300 sm:pl-6">
          <div className="flex items-center gap-2 section-label">
            <TrendingUp size={14} /> Transactions
          </div>
          <p className="stat-number mt-2">{history.length}</p>
          <Link to="/tokens" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-forest-600 hover:text-forest-700">
            View history <ArrowRight size={11} />
          </Link>
        </div>
      </section>

      {/* Recent activity — two column editorial layout */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-lg font-semibold text-ink-900">Recent Token Activity</h2>
          {recentEarned.length === 0 ? (
            <div className="card mt-3 p-6 text-center">
              <p className="text-sm text-ink-400">No activity yet.</p>
              <p className="mt-1 text-sm text-ink-500">Run an AI summarization to earn your first tokens.</p>
            </div>
          ) : (
            <div className="mt-3 divide-y divide-paper-300 border-y border-paper-300">
              {recentEarned.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{tx.type}</p>
                    <p className="text-xs text-ink-400">
                      {new Date(tx.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-forest-600">+{tx.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-ink-900">Latest Content</h2>
          {(contentData?.items ?? []).length === 0 ? (
            <div className="card mt-3 p-6 text-center">
              <p className="text-sm text-ink-400">No content yet.</p>
              <Link to="/content" className="mt-1 inline-block text-sm font-medium text-forest-600 hover:text-forest-700">
                Create your first content →
              </Link>
            </div>
          ) : (
            <div className="mt-3 divide-y divide-paper-300 border-y border-paper-300">
              {(contentData?.items ?? []).slice(0, 4).map((c) => (
                <Link key={c.id} to="/content" className="block py-3 transition-colors hover:bg-paper-200/50 -mx-2 px-2 rounded">
                  <p className="text-sm font-medium text-ink-900 line-clamp-1">{c.title}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {c.tags.slice(0, 3).map((t) => (
                      <span key={t} className="tag-badge">{t}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import { api } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import TokenDashboard from '@/components/TokenDashboard';
import TokenConverter from '@/components/TokenConverter';
import { FileText, Coins, Activity, Loader2 } from 'lucide-react';

export default function Admin() {
  const { data: contentData, loading: contentLoading } = useApi(() => api.listContent(), []);
  const { data: balanceData } = useApi(() => api.getBalance(), []);
  const { data: historyData, loading: historyLoading } = useApi(() => api.getHistory(), []);

  const contents = contentData?.items ?? [];
  const history = historyData?.items ?? [];
  const balance = balanceData?.balance ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="section-label">System Overview</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink-900">Admin</h1>
        <p className="mt-2 text-sm text-ink-600">System-wide view of content, tokens, and all activity.</p>
      </div>

      {/* Summary tiles */}
      <div className="grid gap-4 border-y border-paper-300 py-6 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 section-label"><FileText size={14} /> Content</div>
          <p className="stat-number mt-2">{contentData?.total ?? 0}</p>
        </div>
        <div className="sm:border-l sm:border-paper-300 sm:pl-6">
          <div className="flex items-center gap-2 section-label"><Coins size={14} /> Token Balance</div>
          <p className="stat-number mt-2">{balance}</p>
        </div>
        <div className="sm:border-l sm:border-paper-300 sm:pl-6">
          <div className="flex items-center gap-2 section-label"><Activity size={14} /> Transactions</div>
          <p className="stat-number mt-2">{historyData?.total ?? 0}</p>
        </div>
      </div>

      {/* Content table */}
      <div className="card overflow-hidden">
        <div className="border-b border-paper-300 px-5 py-3">
          <h2 className="font-serif text-base font-semibold text-ink-900">All Content</h2>
        </div>
        {contentLoading ? (
          <div className="flex items-center justify-center p-8 text-ink-400"><Loader2 className="animate-spin" size={20} /></div>
        ) : contents.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-400">No content created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-300 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-2.5">Title</th>
                  <th className="px-5 py-2.5">Tags</th>
                  <th className="px-5 py-2.5">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200">
                {contents.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-paper-200/40">
                    <td className="px-5 py-3 text-ink-900 line-clamp-1 max-w-xs">{c.title}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <span key={t} className="tag-badge">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-400 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Token dashboard + converter */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TokenDashboard />
        <TokenConverter />
      </div>

      {/* Transaction ledger */}
      <div className="card overflow-hidden">
        <div className="border-b border-paper-300 px-5 py-3">
          <h2 className="font-serif text-base font-semibold text-ink-900">Transaction Ledger</h2>
        </div>
        {historyLoading ? (
          <div className="flex items-center justify-center p-8 text-ink-400"><Loader2 className="animate-spin" size={20} /></div>
        ) : history.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-400">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paper-300 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-2.5">Type</th>
                  <th className="px-5 py-2.5">Source</th>
                  <th className="px-5 py-2.5 text-right">Amount</th>
                  <th className="px-5 py-2.5 text-right">Balance After</th>
                  <th className="px-5 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-200">
                {history.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-paper-200/40">
                    <td className="px-5 py-3 font-medium text-ink-900">{tx.type}</td>
                    <td className="px-5 py-3 text-ink-500">{tx.source}</td>
                    <td className={`px-5 py-3 text-right font-mono font-semibold ${tx.amount > 0 ? 'text-forest-600' : 'text-clay-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-ink-700">{tx.balanceAfter}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-400 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

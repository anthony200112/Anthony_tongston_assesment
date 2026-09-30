import { api } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { Coins, ArrowDownRight, TrendingUp, Wallet } from 'lucide-react';

interface HistoryItem {
  id: string;
  type: string;
  source: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export default function TokenDashboard() {
  const { data: balanceData, refetch: refetchBalance } = useApi(() => api.getBalance(), []);
  const { data: historyData, refetch: refetchHistory } = useApi(() => api.getHistory(), []);

  const balance = balanceData?.balance ?? 0;
  const history: HistoryItem[] = historyData?.items || [];

  const earned = history.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = history.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  function refresh() {
    refetchBalance();
    refetchHistory();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="section-label">Ledger</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink-900">Token Dashboard</h1>
        </div>
        <button onClick={refresh} className="btn-secondary text-xs">Refresh</button>
      </div>

      {/* Balance — three flat stat blocks with borders */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center gap-2 section-label">
            <Wallet size={14} /> Current Balance
          </div>
          <p className="stat-number mt-2">{balance}</p>
          <p className="mt-1 text-xs text-ink-400">T-World Tokens</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 section-label">
            <TrendingUp size={14} /> Total Earned
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold text-forest-600">+{earned}</p>
          <p className="mt-1 text-xs text-ink-400">from AI runs</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 section-label">
            <ArrowDownRight size={14} /> Total Spent
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold text-clay-500">-{spent}</p>
          <p className="mt-1 text-xs text-ink-400">conversions + withdrawals</p>
        </div>
      </div>

      {/* History — table-like list with dividers */}
      <div className="card overflow-hidden">
        <div className="border-b border-paper-300 px-5 py-3">
          <h2 className="font-serif text-base font-semibold text-ink-900">Transaction History</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-ink-400">No transactions yet.</p>
            <p className="mt-1 text-sm text-ink-500">Run an AI summarization to earn your first tokens.</p>
          </div>
        ) : (
          <div className="divide-y divide-paper-300">
            {history.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-md ${
                    tx.amount > 0 ? 'bg-forest-50 text-forest-600' : 'bg-clay-400/10 text-clay-500'
                  }`}>
                    {tx.amount > 0 ? <Coins size={15} /> : <ArrowDownRight size={15} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {tx.type} <span className="text-ink-400">· {tx.source}</span>
                    </p>
                    <p className="font-mono text-xs text-ink-400">
                      {new Date(tx.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm font-semibold ${tx.amount > 0 ? 'text-forest-600' : 'text-clay-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                  <p className="font-mono text-xs text-ink-400">bal: {tx.balanceAfter}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

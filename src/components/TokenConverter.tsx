import { useState } from 'react';
import { api } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { Loader2, ArrowRight, CheckCircle, Coins } from 'lucide-react';

const ASSETS = [
  { key: 'MOCK_USDT' as const, name: 'MOCK USDT', symbol: 'USDT', rate: '100 TWD = 1 USDT' },
  { key: 'MOCK_ETH' as const, name: 'MOCK ETH', symbol: 'ETH', rate: '200 TWD = 0.01 ETH' },
];

export default function TokenConverter() {
  const { data: balanceData, refetch } = useApi(() => api.getBalance(), []);
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<'MOCK_USDT' | 'MOCK_ETH'>('MOCK_USDT');
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<{ amountOut: number; txHash: string; remainingBalance: number; toAsset: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const balance = balanceData?.balance ?? 0;

  async function handleConvert() {
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) {
      setError('Enter a valid whole number of tokens.');
      return;
    }
    setConverting(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.convert(amt, asset);
      setResult({ amountOut: res.amountOut, txHash: res.txHash, remainingBalance: res.remainingBalance, toAsset: res.toAsset });
      setAmount('');
      refetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setConverting(false);
    }
  }

  const selectedAsset = ASSETS.find((a) => a.key === asset)!;

  return (
    <div className="space-y-5">
      <div>
        <p className="section-label">Exchange</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-ink-900">Convert Tokens</h2>
      </div>

      <div className="card space-y-5 p-6">
        {/* Balance display */}
        <div className="flex items-center justify-between rounded-md border border-paper-300 bg-paper-200/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <Coins size={16} className="text-forest-500" /> Available Balance
          </div>
          <span className="font-mono text-xl font-semibold text-ink-900">{balance} <span className="text-xs font-normal text-ink-400">TWD</span></span>
        </div>

        {/* Asset selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">Target Asset</label>
          <div className="grid grid-cols-2 gap-3">
            {ASSETS.map((a) => (
              <button
                key={a.key}
                onClick={() => setAsset(a.key)}
                className={`rounded-md border p-3 text-left transition-colors ${
                  asset === a.key
                    ? 'border-forest-500 bg-forest-50'
                    : 'border-paper-300 bg-paper-50 hover:border-ink-300'
                }`}
              >
                <p className="text-sm font-semibold text-ink-900">{a.name}</p>
                <p className="mt-0.5 font-mono text-xs text-ink-400">{a.rate}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Amount input */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Amount (tokens)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 200"
            className="input-field font-mono"
          />
          <div className="mt-2 flex gap-2">
            {[50, 100, 200].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="rounded border border-paper-300 px-2.5 py-1 font-mono text-xs text-ink-500 transition-colors hover:bg-paper-200"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="rounded-md border border-clay-400/40 bg-clay-400/10 p-3 text-sm text-clay-500">{error}</div>}

        <button
          onClick={handleConvert}
          disabled={converting || !amount}
          className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50"
        >
          {converting ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          {converting ? 'Converting…' : `Convert to ${selectedAsset.name}`}
        </button>

        {/* Result */}
        {result && (
          <div className="rounded-md border border-forest-400/40 bg-forest-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-forest-600">
              <CheckCircle size={16} />
              <span className="text-sm font-semibold">Conversion Successful</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="section-label">Received</p>
                <p className="mt-0.5 font-mono font-semibold text-ink-900">{result.amountOut} {result.toAsset.replace('MOCK_', '')}</p>
              </div>
              <div>
                <p className="section-label">Remaining</p>
                <p className="mt-0.5 font-mono font-semibold text-ink-900">{result.remainingBalance} TWD</p>
              </div>
              <div className="col-span-2">
                <p className="section-label">Transaction Hash</p>
                <p className="mt-0.5 break-all font-mono text-xs text-ink-500">{result.txHash}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

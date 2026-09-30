/**
 * API client for the Tongston T-World backend.
 *
 * Talks to the real backend when VITE_API_URL is set (production).
 * Falls back to an in-browser mock when no URL is configured so the
 * frontend is fully functional during local development without a server.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

const IS_MOCK = !BASE_URL;

// ── In-memory mock store ────────────────────────────────────────
// Starts empty — users build up state by creating content and running AI.
const mock = {
  contents: [] as Array<{
    id: string;
    title: string;
    body: string;
    tags: string[];
    createdBy: string;
    createdAt: string;
  }>,
  balance: 0,
  history: [] as Array<{
    id: string;
    type: string;
    source: string;
    amount: number;
    balanceAfter: number;
    createdAt: string;
  }>,
};

const RATES = { MOCK_USDT: 100, MOCK_ETH: 20000 };

function mockTxHash() {
  const hex = '0123456789abcdef';
  let h = '0x';
  for (let i = 0; i < 64; i += 1) h += hex[Math.floor(Math.random() * hex.length)];
  return h;
}

function extractSentences(text: string, count: number) {
  return text.split(/(?<=[.!?])\s+/).slice(0, count).join(' ');
}

// ── HTTP helper ─────────────────────────────────────────────────
async function http(method: string, path: string, body?: unknown) {
  const token = localStorage.getItem('tworld_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed with status ${res.status}`);
  return data;
}

// ── Public API ──────────────────────────────────────────────────
export const api = {
  isMock: IS_MOCK,

  async listContent({ tag, q, page = 1 } = {}) {
    if (IS_MOCK) {
      let items = [...mock.contents];
      if (tag) items = items.filter((c) => c.tags.includes(tag));
      if (q) items = items.filter((c) => (c.title + c.body).toLowerCase().includes(q.toLowerCase()));
      return { items, total: items.length, page, limit: 20, totalPages: 1 };
    }
    const params = new URLSearchParams();
    if (tag) params.set('tag', tag);
    if (q) params.set('q', q);
    params.set('page', String(page));
    return http('GET', `/content?${params}`);
  },

  async createContent({ title, body, tags = [] }: { title: string; body: string; tags?: string[] }) {
    if (IS_MOCK) {
      const c = { id: `mock-${Date.now()}`, title, body, tags, createdBy: 'mock-admin', createdAt: new Date().toISOString() };
      mock.contents.unshift(c);
      return c;
    }
    return http('POST', '/content', { title, body, tags });
  },

  async getContent(id: string) {
    if (IS_MOCK) {
      const c = mock.contents.find((x) => x.id === id);
      if (!c) throw new Error('Content not found');
      return c;
    }
    return http('GET', `/content/${id}`);
  },

  async summarize(id: string, { tone = 'neutral', length = 'medium' } = {}) {
    if (IS_MOCK) {
      const c = mock.contents.find((x) => x.id === id);
      if (!c) throw new Error('Content not found');
      const counts: Record<string, number> = { short: 1, medium: 2, long: 3 };
      const prefixes: Record<string, string> = { neutral: '', professional: 'Key points: ', casual: "Here's the gist — ", academic: 'Summary: ' };
      const output = prefixes[tone] + extractSentences(c.body, counts[length]);
      const latencyMs = 50 + Math.floor(Math.random() * 200);
      mock.balance += 5;
      mock.history.unshift({
        id: `t${Date.now()}`,
        type: 'EARN',
        source: 'AI_USAGE',
        amount: 5,
        balanceAfter: mock.balance,
        createdAt: new Date().toISOString(),
      });
      return { output, latencyMs, tokensAwarded: 5, totalTokenBalance: mock.balance, status: 'success' };
    }
    return http('POST', `/content/${id}/ai/summarize`, { tone, length });
  },

  async getBalance() {
    if (IS_MOCK) return { balance: mock.balance };
    return http('GET', '/tokens/balance');
  },

  async getHistory({ page = 1 } = {}) {
    if (IS_MOCK) return { items: mock.history, total: mock.history.length, page, limit: 20, totalPages: 1 };
    return http('GET', `/tokens/history?page=${page}`);
  },

  async convert(amount: number, toAsset: 'MOCK_USDT' | 'MOCK_ETH') {
    if (IS_MOCK) {
      if (mock.balance < amount) throw new Error(`Insufficient balance. You have ${mock.balance} tokens.`);
      const amountOut = amount / RATES[toAsset];
      mock.balance -= amount;
      const txHash = mockTxHash();
      mock.history.unshift({
        id: `t${Date.now()}`,
        type: 'CONVERT',
        source: 'MANUAL',
        amount: -amount,
        balanceAfter: mock.balance,
        createdAt: new Date().toISOString(),
      });
      return { fromToken: 'TWD', toAsset, amountIn: amount, amountOut, exchangeRate: RATES[toAsset], txHash, status: 'completed', remainingBalance: mock.balance };
    }
    return http('POST', '/tokens/convert', { amount, toAsset });
  },

  async withdraw(amount: number, address: string) {
    if (IS_MOCK) {
      if (mock.balance < amount) throw new Error(`Insufficient balance. You have ${mock.balance} tokens.`);
      mock.balance -= amount;
      const txHash = mockTxHash();
      mock.history.unshift({
        id: `t${Date.now()}`,
        type: 'WITHDRAW',
        source: 'MANUAL',
        amount: -amount,
        balanceAfter: mock.balance,
        createdAt: new Date().toISOString(),
      });
      return { amount, address, txHash, status: 'completed', remainingBalance: mock.balance };
    }
    return http('POST', '/tokens/withdraw', { amount, address });
  },

  async register(email: string, password: string) {
    if (IS_MOCK) {
      const token = `mock-token-${Date.now()}`;
      localStorage.setItem('tworld_token', token);
      return { token, user: { email, role: 'user', tokenBalance: 0 } };
    }
    const data = await http('POST', '/auth/register', { email, password });
    localStorage.setItem('tworld_token', (data as { token: string }).token);
    return data;
  },

  async login(email: string, password: string) {
    if (IS_MOCK) {
      const token = `mock-token-${Date.now()}`;
      localStorage.setItem('tworld_token', token);
      return { token, user: { email, role: 'admin', tokenBalance: mock.balance } };
    }
    const data = await http('POST', '/auth/login', { email, password });
    localStorage.setItem('tworld_token', (data as { token: string }).token);
    return data;
  },

  logout() {
    localStorage.removeItem('tworld_token');
  },
};

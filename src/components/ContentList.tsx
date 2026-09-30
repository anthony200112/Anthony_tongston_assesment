import { useState } from 'react';
import { api } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { FileText, Plus, Search, X, Loader2 } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
}

export default function ContentList() {
  const [tag, setTag] = useState('');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTags, setNewTags] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApi(
    () => api.listContent({ tag: tag || undefined, q: query || undefined }),
    [tag, query],
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (newTitle.trim().length < 3) {
      setFormError('Title must be at least 3 characters.');
      return;
    }
    if (newBody.trim().length < 10) {
      setFormError('Body must be at least 10 characters.');
      return;
    }
    setCreating(true);
    try {
      const tags = newTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      await api.createContent({ title: newTitle.trim(), body: newBody.trim(), tags });
      setNewTitle('');
      setNewBody('');
      setNewTags('');
      setShowForm(false);
      refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setCreating(false);
    }
  }

  const items: ContentItem[] = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-label">Library</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink-900">Content</h1>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className={showForm ? 'btn-secondary inline-flex items-center gap-2' : 'btn-primary inline-flex items-center gap-2'}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Content'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Title</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter a title…"
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Body</label>
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Write the content body…"
              rows={5}
              className="input-field resize-y"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Tags (comma-separated)</label>
            <input
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="ai, education, tokens"
              className="input-field"
            />
          </div>
          {formError && <p className="text-sm text-clay-500">{formError}</p>}
          <button type="submit" disabled={creating} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
            {creating && <Loader2 size={16} className="animate-spin" />}
            Create Content
          </button>
        </form>
      )}

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search content…"
            className="input-field pl-9"
          />
        </div>
        <div className="relative flex-1 min-w-[160px]">
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Filter by tag…"
            className="input-field"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-ink-400">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}

      {error && (
        <div className="rounded-md border border-clay-400/40 bg-clay-400/10 p-4 text-sm text-clay-500">{error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="card p-12 text-center">
          <FileText size={28} className="mx-auto text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">No content found. Create some to get started.</p>
        </div>
      )}

      {/* Content grid — magazine-style cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((item, i) => (
          <article key={item.id} className={`card card-hover p-6 ${i === 0 ? 'sm:col-span-2' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-serif text-lg font-semibold text-ink-900 leading-snug">{item.title}</h3>
            </div>
            <p className={`mt-2 text-sm leading-relaxed text-ink-600 ${i === 0 ? 'line-clamp-4' : 'line-clamp-3'}`}>{item.body}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <span key={t} className="tag-badge">{t}</span>
                ))}
              </div>
              <p className="font-mono text-xs text-ink-400">
                {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

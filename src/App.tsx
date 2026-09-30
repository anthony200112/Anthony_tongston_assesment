import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Home from '@/pages/Home';
import ContentPage from '@/pages/ContentPage';
import AIPage from '@/pages/AIPage';
import TokensPage from '@/pages/TokensPage';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-paper-100">
        <Navigation />
        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/tokens" element={<TokensPage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <footer className="border-t border-paper-300 py-8">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <p className="font-serif text-sm font-semibold text-forest-600">Tongston T-World</p>
            <p className="mt-1 text-xs text-ink-400">Content, AI & Tokenized Rewards Module</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}

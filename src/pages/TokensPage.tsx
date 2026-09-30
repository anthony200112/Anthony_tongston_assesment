import TokenDashboard from '@/components/TokenDashboard';
import TokenConverter from '@/components/TokenConverter';

export default function TokensPage() {
  return (
    <div className="space-y-8">
      <TokenDashboard />
      <TokenConverter />
    </div>
  );
}

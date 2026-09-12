import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Loader, AlertCircle, ShoppingBag } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

export function ProductReplenishmentBadge() {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchWithAuth(
          `${API_BASE_URL}/products/purchases/replenishment/due`,
          { method: 'GET' }
        );
        const json = await response.json();
        if (!response.ok) {
          throw new Error(typeof json?.detail === 'string' ? json.detail : 'Failed to load replenishment data');
        }
        setData(json);
      } catch (err) {
        console.error('Replenishment load error:', err);
        setError(err.message || 'Failed to load replenishment data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Replenishment Due</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader className="w-4 h-4 text-amber-400 animate-spin" />
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Replenishment Due</h3>
        </div>
        <div className="flex items-center gap-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </GlassCard>
    );
  }

  // Backend returns: { overdue: [...], due_soon: [...], overdue_count, due_soon_count }
  const overdueList = data?.overdue || [];
  const dueSoonList = data?.due_soon || [];

  if (overdueList.length === 0 && dueSoonList.length === 0) {
    return (
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Replenishment Due</h3>
        </div>
        <p className="text-xs text-slate-400">✓ No products due for replenishment</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingBag className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-white">Replenishment Due</h3>
      </div>

      {overdueList.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-rose-400">Overdue:</p>
          {overdueList.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-2 p-2 bg-rose-500/5 rounded-lg border border-rose-500/20">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{p.product_name}</p>
                <p className="text-[10px] text-rose-400">{p.days_overdue} day{p.days_overdue !== 1 ? 's' : ''} overdue</p>
              </div>
              <Badge variant="rose">Overdue</Badge>
            </div>
          ))}
          {overdueList.length > 3 && <p className="text-[10px] text-slate-500 pl-2">+{overdueList.length - 3} more</p>}
        </div>
      )}

      {dueSoonList.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-400">Due Soon:</p>
          {dueSoonList.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-start justify-between gap-2 p-2 bg-amber-500/5 rounded-lg border border-amber-500/20">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{p.product_name}</p>
                <p className="text-[10px] text-amber-400">Due in {p.days_until_due} day{p.days_until_due !== 1 ? 's' : ''}</p>
              </div>
              <Badge variant="amber">Due</Badge>
            </div>
          ))}
          {dueSoonList.length > 3 && <p className="text-[10px] text-slate-500 pl-2">+{dueSoonList.length - 3} more</p>}
        </div>
      )}

      <div className="pt-2 border-t border-slate-800/50 text-xs">
        {overdueList.length > 0 && <span className="text-rose-400 font-semibold">{overdueList.length} overdue{dueSoonList.length > 0 ? ', ' : ''}</span>}
        {dueSoonList.length > 0 && <span className="text-amber-400 font-semibold">{dueSoonList.length} due soon</span>}
      </div>
    </GlassCard>
  );
}

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, AlertTriangle, Clock, CheckCircle2, AlertCircle, Download, FileSpreadsheet, Loader2 } from 'lucide-react';

export function ProductReport({ data, loading, error, onRetry, onExportPDF, onExportExcel, exportingPDF, exportingExcel }) {
  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard>
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <p className="text-sm text-rose-300 mb-3">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-medium hover:bg-rose-500/30"
            >
              Retry
            </button>
          )}
        </div>
      </GlassCard>
    );
  }

  if (!data) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="font-bold text-white mb-2">No Product Data</h3>
          <p className="text-sm text-slate-400">
            Complete your skin assessment to get product recommendations.
          </p>
        </div>
      </GlassCard>
    );
  }

  const { user_profile, purchase_summary, overdue_products, due_soon_products, purchase_history } = data;

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      {data && (
        <div className="flex gap-3">
          <button
            onClick={onExportPDF}
            disabled={exportingPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-medium hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {exportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={onExportExcel}
            disabled={exportingExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm font-medium hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {exportingExcel ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Excel...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                Download Excel
              </>
            )}
          </button>
        </div>
      )}

      {/* User Profile Summary */}
      {user_profile && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">Your Skin Profile</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="emerald">{user_profile.skin_type}</Badge>
            <Badge variant="amber">{user_profile.sensitivity} Sensitivity</Badge>
          </div>
          {user_profile.concerns && user_profile.concerns.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {user_profile.concerns.map((concern, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-300">
                  {concern}
                </span>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Purchase Summary */}
      {purchase_summary && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Purchase Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Total Purchases</p>
              <p className="text-lg font-bold text-white">{purchase_summary.total_purchases || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Overdue</p>
              <p className="text-lg font-bold text-rose-400">{purchase_summary.overdue_count || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Due Soon</p>
              <p className="text-lg font-bold text-amber-400">{purchase_summary.due_soon_count || 0}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Overdue Products */}
      {overdue_products && overdue_products.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Overdue for Replenishment
          </h3>
          <div className="space-y-2">
            {overdue_products.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30"
              >
                <p className="font-medium text-white">{product.product_name}</p>
                <p className="text-xs text-rose-300 mt-1">
                  Overdue by {product.days_overdue} days
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Due Soon Products */}
      {due_soon_products && due_soon_products.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Due Soon
          </h3>
          <div className="space-y-2">
            {due_soon_products.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
              >
                <p className="font-medium text-white">{product.product_name}</p>
                <p className="text-xs text-amber-300 mt-1">
                  Due in {product.days_until_due} days
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Purchase History */}
      {purchase_history && purchase_history.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Purchase History
          </h3>
          <div className="space-y-2">
            {purchase_history.slice(0, 10).map((purchase) => (
              <div
                key={purchase.id}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-white">{purchase.product_name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="slate">Qty: {purchase.quantity}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

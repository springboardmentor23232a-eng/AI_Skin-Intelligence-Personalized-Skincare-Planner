import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

/**
 * Format FastAPI validation errors into readable text.
 */
function formatApiError(detail) {
  if (!detail) return 'An unexpected error occurred';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : 'field';
        const msg = err.msg || 'Invalid value';
        return `${field}: ${msg}`;
      })
      .join('\n');
  }
  return JSON.stringify(detail);
}

export function ProductPurchaseModal({ isOpen, onClose, onSuccess, product = null }) {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    purchase_date: new Date().toISOString().split('T')[0],
    quantity: 1,
    estimated_replenishment_date: '',
  });

  // Pre-fill product fields when modal opens for a specific product
  useEffect(() => {
    if (product) {
      setFormData((prev) => ({
        ...prev,
        product_id: String(product.id || product.product_id || ''),
        product_name: String(product.name || product.product_name || ''),
      }));
    }
  }, [product]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'quantity'
          ? value === '' ? '' : parseInt(value, 10)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Frontend validation
    if (!formData.product_id.trim()) {
      setError('Product ID is required');
      return;
    }
    if (!formData.product_name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.purchase_date) {
      setError('Purchase date is required');
      return;
    }
    const qty = Number(formData.quantity);
    if (!formData.quantity || isNaN(qty) || qty <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    try {
      setLoading(true);

      // Backend expects query parameters, NOT a JSON body.
      const params = new URLSearchParams();
      params.set('product_id', formData.product_id.trim());
      params.set('product_name', formData.product_name.trim());
      params.set('purchase_date', formData.purchase_date);
      params.set('quantity', String(qty));
      if (formData.estimated_replenishment_date) {
        params.set('estimated_replenishment_date', formData.estimated_replenishment_date);
      }

      const url = `${API_BASE_URL}/products/purchases?${params.toString()}`;

      const response = await fetchWithAuth(url, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(formatApiError(data?.detail));
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
    } catch (err) {
      console.error('Error saving purchase:', err);
      setError(err.message || 'Failed to save purchase');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Log Purchase</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <pre className="whitespace-pre-wrap font-sans">{error}</pre>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Purchase logged successfully
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Product ID
            </label>
            <input
              type="text"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              placeholder="e.g., prod_123"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              placeholder="e.g., Moisturizing Cream"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              step="1"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Estimated Replenishment Date — Optional
            </label>
            <input
              type="date"
              name="estimated_replenishment_date"
              value={formData.estimated_replenishment_date}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-1">When you expect to need to repurchase</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Log Purchase'
              )}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

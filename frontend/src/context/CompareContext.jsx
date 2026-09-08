import { createContext, useContext, useMemo, useState, useCallback } from 'react';

/**
 * Product Comparison selection state, shared across the whole user
 * dashboard (not just one tab) so a product selected for comparison from
 * the Skincare Plan's recommendations, the "For You" list, or the Browse
 * Products grid can all end up in the same comparison, exactly as the
 * spec describes: "select 2-4 products from AI recommended products,
 * Browse products, or product recommendation results."
 *
 * Deliberately holds only { id, name, brand } per selected product (just
 * enough to render chips in CompareBar) — the actual comparison data
 * (AI suitability score, best match, etc.) is always fetched fresh from
 * GET /api/products/compare when the modal opens, never computed
 * client-side, so it's always personalized to the user's latest profile.
 */
const CompareContext = createContext(null);

const MAX_COMPARE = 4;

export function CompareProvider({ children }) {
  const [selected, setSelected] = useState([]); // [{id, name, brand}]
  const [modalOpen, setModalOpen] = useState(false);
  const [limitNotice, setLimitNotice] = useState('');

  const isSelected = useCallback((id) => selected.some((p) => p.id === id), [selected]);

  const toggle = useCallback((product) => {
    if (!product?.id) return;
    setLimitNotice('');
    setSelected((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= MAX_COMPARE) {
        setLimitNotice(`You can compare up to ${MAX_COMPARE} products at a time — remove one first.`);
        return prev;
      }
      return [...prev, { id: product.id, name: product.name, brand: product.brand }];
    });
  }, []);

  const remove = useCallback((id) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => {
    setSelected([]);
    setLimitNotice('');
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const value = useMemo(() => ({
    selected, isSelected, toggle, remove, clear, modalOpen, openModal, closeModal, limitNotice, maxCompare: MAX_COMPARE,
  }), [selected, isSelected, toggle, remove, clear, modalOpen, openModal, closeModal, limitNotice]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  // Defensive fallback so any ProductCard rendered outside the provider
  // (e.g. a future standalone usage) simply hides the Compare checkbox
  // instead of crashing the page.
  if (!ctx) {
    return {
      selected: [], isSelected: () => false, toggle: () => {}, remove: () => {}, clear: () => {},
      modalOpen: false, openModal: () => {}, closeModal: () => {}, limitNotice: '', maxCompare: MAX_COMPARE, disabled: true,
    };
  }
  return ctx;
}

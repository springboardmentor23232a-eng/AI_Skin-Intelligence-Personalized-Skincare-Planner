import { useCompare } from '../context/CompareContext';

/**
 * Floating bar that appears once at least one product is selected for
 * comparison, from anywhere in the dashboard (recommendations, Skincare
 * Plan, or Browse Products). Rendered once at the UserDashboard level so
 * a selection made on one tab is still visible after switching tabs.
 */
export default function CompareBar() {
  const { selected, remove, clear, openModal, limitNotice, maxCompare } = useCompare();

  if (selected.length === 0) return null;

  return (
    <div className="compare-bar">
      <div className="compare-bar-inner">
        <div className="compare-bar-chips">
          <span className="compare-bar-count">{selected.length}/{maxCompare} selected</span>
          {selected.map((p) => (
            <span key={p.id} className="compare-chip">
              {p.name}
              <button type="button" aria-label={`Remove ${p.name} from comparison`} onClick={() => remove(p.id)}>×</button>
            </span>
          ))}
        </div>
        {limitNotice && <div className="compare-bar-notice">{limitNotice}</div>}
        <div className="compare-bar-actions">
          <button className="btn btn-outline btn-sm" type="button" onClick={clear}>Clear</button>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={openModal}
            disabled={selected.length < 2}
            title={selected.length < 2 ? 'Select at least 2 products to compare.' : 'Compare selected products'}
          >
            Compare Selected
          </button>
        </div>
      </div>
    </div>
  );
}

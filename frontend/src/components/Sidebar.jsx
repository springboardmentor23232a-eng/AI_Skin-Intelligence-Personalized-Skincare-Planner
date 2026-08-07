export default function Sidebar({ items, active, onSelect }) {
  return (
    <aside className="sidebar">
      {items.map((item) => (
        <button
          key={item.key}
          className={`sidebar-link ${active === item.key ? 'active' : ''}`}
          onClick={() => onSelect(item.key)}
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </aside>
  );
}

function Sidebar({ onSelect }) {
  return (
    <aside className="sidebar">
      <h2>Dashboards</h2>
      <button type="button" onClick={() => onSelect('user')}>
        User Dashboard
      </button>
      <button type="button" onClick={() => onSelect('consultant')}>
        Consultant Dashboard
      </button>
      <button type="button" onClick={() => onSelect('admin')}>
        Admin Dashboard
      </button>
    </aside>
  )
}

export default Sidebar

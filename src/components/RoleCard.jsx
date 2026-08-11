function RoleCard({ title, children }) {
  return (
    <div className="card shadow h-100">
      <div className="card-body">
        <h4 className="card-title">{title}</h4>
        {children}
      </div>
    </div>
  );
}

export default RoleCard;
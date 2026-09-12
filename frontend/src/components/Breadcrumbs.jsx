import { Link, useLocation } from "react-router-dom";

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb mb-0" style={{ fontSize: "0.85rem" }}>
        <li className="breadcrumb-item">
          <Link to="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const formattedName = value.charAt(0).toUpperCase() + value.slice(1);

          return isLast ? (
            <li
              key={to}
              className="breadcrumb-item active"
              aria-current="page"
              style={{ color: "var(--accent-primary)", fontWeight: "600" }}
            >
              {formattedName}
            </li>
          ) : (
            <li key={to} className="breadcrumb-item">
              <Link to={to} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                {formattedName}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;

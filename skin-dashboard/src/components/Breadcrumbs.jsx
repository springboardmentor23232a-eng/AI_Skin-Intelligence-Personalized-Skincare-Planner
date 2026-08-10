import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-decoration-none"
          >
            <Home size={13} />
            <span>Home</span>
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const formattedName = value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <li key={to} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-slate-300 dark:text-slate-600" />
              {isLast ? (
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {formattedName}
                </span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-decoration-none"
                >
                  {formattedName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;

import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">

        <Link className="navbar-brand" to="/">
          AI Skin Intelligence
        </Link>

        <div className="navbar-nav ms-auto">

          <Link className="nav-link" to="/">
            Home
          </Link>

          <Link className="nav-link" to="/login">
            Login
          </Link>

          <Link className="nav-link" to="/user">
            Dashboard
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;
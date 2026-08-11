import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";

function Layout({ children }) {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-canvas)" }}>
      <Navbar />
      <div className="d-flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 w-100" style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-canvas)" }}>
      <Navbar />

      <main className="flex-1 py-5">
        <div className="container text-center max-w-4xl mx-auto px-4">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-4 rounded-pill badge-saas badge-saas-primary">
            <span>✨</span>
            <span>Next-Gen AI Healthcare Platform</span>
          </div>

          <h1 className="display-4 fw-extrabold mb-3" style={{ color: "var(--text-primary)", letterSpacing: "-1px" }}>
            AI-Powered Clinical Skin Intelligence & Personalized Care
          </h1>

          <p className="lead mb-5 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)", fontSize: "1.15rem" }}>
            Precision dermatological assessment, adaptive routine generation, ingredient intelligence, and multi-role clinical collaboration.
          </p>

          <div className="d-flex align-items-center justify-content-center gap-3 mb-5">
            {user ? (
              <Link to={user.role === "SKINCARE_CONSULTANT" ? "/consultant" : user.role === "ADMIN" ? "/admin" : "/user"} className="btn btn-saas btn-lg px-4">
                Launch Workspace →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-saas btn-lg px-4">
                  Get Started Free →
                </Link>
                <Link to="/login" className="btn btn-saas-secondary btn-lg px-4">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Feature Grid */}
          <div className="row g-4 mt-4 text-start">
            <div className="col-md-4">
              <div className="saas-card h-100">
                <div className="stat-icon-wrapper mb-3">🧬</div>
                <h5 className="fw-bold mb-2" style={{ color: "var(--text-primary)" }}>Ingredient Intelligence</h5>
                <p className="text-secondary small mb-0">
                  Analyze active ingredients, compatibility conflicts, and skin type suitability with real-time AI scoring.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="saas-card h-100">
                <div className="stat-icon-wrapper mb-3">⚡</div>
                <h5 className="fw-bold mb-2" style={{ color: "var(--text-primary)" }}>Adaptive Routines</h5>
                <p className="text-secondary small mb-0">
                  Dynamic morning, evening, and seasonal routines tailored to hydration levels, UV exposure, and climate.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="saas-card h-100">
                <div className="stat-icon-wrapper mb-3">🛡️</div>
                <h5 className="fw-bold mb-2" style={{ color: "var(--text-primary)" }}>Clinical Governance</h5>
                <p className="text-secondary small mb-0">
                  Multi-role access control for Users, Skincare Consultants, and System Administrators with PostgreSQL audit logging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 border-top text-center text-muted small" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
        © 2026 AI Skin Intelligence Platform. Enterprise Production Ready.
      </footer>
    </div>
  );
}

export default Home;
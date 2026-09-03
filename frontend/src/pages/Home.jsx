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
            <span>Intelligent Skin Wellness</span>
          </div>

          <h1 className="display-4 fw-bold mb-3" style={{ color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            Personalized Skin Intelligence, Tailored to Your Barrier
          </h1>

          <p className="lead mb-5 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)", fontSize: "1.15rem" }}>
            Daily routine guidance, active ingredient compatibility, and holistic skin health tracking designed for your unique skin type and concerns.
          </p>

          <div className="d-flex align-items-center justify-content-center gap-3 mb-5">
            {user ? (
              <Link to={user.role === "SKINCARE_CONSULTANT" ? "/consultant" : user.role === "ADMIN" ? "/admin" : "/user"} className="btn btn-saas btn-lg px-4">
                Open Dashboard →
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
                <div className="stat-icon-wrapper mb-3" style={{ color: "var(--accent-primary)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3v18" />
                    <path d="M3 12h18" />
                  </svg>
                </div>
                <h5 className="fw-semibold mb-2" style={{ color: "var(--text-primary)" }}>Ingredient Intelligence</h5>
                <p className="text-secondary small mb-0">
                  Analyze active ingredients, prevent compatibility conflicts, and verify formula safety for your skin type.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="saas-card h-100">
                <div className="stat-icon-wrapper mb-3" style={{ color: "var(--accent-primary)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
                <h5 className="fw-semibold mb-2" style={{ color: "var(--text-primary)" }}>Adaptive Routines</h5>
                <p className="text-secondary small mb-0">
                  Personalized morning and evening skincare rituals calibrated to your moisture balance, lifestyle, and climate.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="saas-card h-100">
                <div className="stat-icon-wrapper mb-3" style={{ color: "var(--accent-primary)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h5 className="fw-semibold mb-2" style={{ color: "var(--text-primary)" }}>Progress Tracking</h5>
                <p className="text-secondary small mb-0">
                  Measure your skin health journey over time with holistic factor tracking and private before/after photo logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 border-top text-center text-muted small" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
        © 2026 AI Skin Intelligence. Designed for everyday barrier wellness.
      </footer>
    </div>
  );
}

export default Home;
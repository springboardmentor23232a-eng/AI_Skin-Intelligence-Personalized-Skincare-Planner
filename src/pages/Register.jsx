import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectToDashboard = (userRole) => {
    if (userRole === "SKINCARE_CONSULTANT") {
      navigate("/consultant");
    } else if (userRole === "ADMIN") {
      navigate("/admin");
    } else if (userRole === "DERMATOLOGIST") {
      navigate("/dermatologist");
    } else {
      navigate("/user");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await register(fullName, email, password, role);
      redirectToDashboard(user.role);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setSubmitting(true);
    try {
      if (!credentialResponse || !credentialResponse.credential) {
        throw new Error("No credential returned from Google");
      }
      const user = await googleLogin(credentialResponse.credential);
      redirectToDashboard(user.role);
    } catch (err) {
      setError(err.message || "Google registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In was unsuccessful. Please try again.");
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-canvas)" }}>
      <Navbar />

      <main className="flex-1 d-flex align-items-center justify-content-center py-5">
        <div className="container" style={{ maxWidth: "480px" }}>
          <div className="saas-card shadow-lg p-4 p-md-5">
            <div className="text-center mb-4">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white mb-3"
                style={{ width: "48px", height: "48px", background: "var(--accent-gradient)" }}
              >
                ✨
              </div>
              <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Create Account</h2>
              <p className="text-secondary small">Join AI Skin Intelligence Platform</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded mb-4" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label-saas">Full Name</label>
                <input
                  type="text"
                  className="form-control-saas"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label-saas">Email Address</label>
                <input
                  type="email"
                  className="form-control-saas"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label-saas">Password</label>
                <input
                  type="password"
                  className="form-control-saas"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label-saas">Select Account Role</label>
                <select
                  className="form-control-saas"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="USER">User (Standard)</option>
                  <option value="SKINCARE_CONSULTANT">Skincare Consultant</option>
                  <option value="DERMATOLOGIST">Dermatologist</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-saas w-100 mb-3"
                disabled={submitting}
              >
                {submitting ? "Creating Account..." : "Create Free Account"}
              </button>
            </form>

            <div className="text-center my-3 text-muted small">OR</div>

            <div className="d-flex justify-content-center mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                shape="pill"
                size="large"
                text="signup_with"
              />
            </div>

            <div className="text-center small text-secondary">
              <span>Already have an account? </span>
              <Link to="/login" className="fw-semibold" style={{ color: "var(--accent-primary)" }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;

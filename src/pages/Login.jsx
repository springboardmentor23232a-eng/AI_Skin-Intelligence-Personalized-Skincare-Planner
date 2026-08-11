import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(email, password);
      redirectToDashboard(user.role);
    } catch (err) {
      setError(err.message || "Invalid email or password");
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
      setError(err.message || "Google Sign-In failed");
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
        <div className="container" style={{ maxWidth: "460px" }}>
          <div className="saas-card shadow-lg p-4 p-md-5">
            <div className="text-center mb-4">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white mb-3"
                style={{ width: "48px", height: "48px", background: "var(--accent-gradient)" }}
              >
                🔐
              </div>
              <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Welcome Back</h2>
              <p className="text-secondary small">Access your AI Skin Intelligence workspace</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded mb-4" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
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

              <div className="mb-4">
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

              <button
                type="submit"
                className="btn btn-saas w-100 mb-3"
                disabled={submitting}
              >
                {submitting ? "Signing in..." : "Sign In to Dashboard"}
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
                text="continue_with"
              />
            </div>

            <div className="text-center small text-secondary">
              <span>Don't have an account? </span>
              <Link to="/register" className="fw-semibold" style={{ color: "var(--accent-primary)" }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
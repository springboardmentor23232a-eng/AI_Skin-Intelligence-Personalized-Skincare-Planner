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
    setError(
      "Google Sign-In Error (401 invalid_client): The Google OAuth Client ID is not configured or not registered in Google Cloud Console. Please add a valid VITE_GOOGLE_CLIENT_ID in frontend/.env."
    );
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
                style={{ width: "44px", height: "44px", background: "var(--accent-gradient)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Welcome Back</h2>
              <p className="text-secondary small">Sign in to your personalized skin intelligence workspace</p>
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

            <div className="d-flex flex-column align-items-center mb-4">
              {import.meta.env.VITE_GOOGLE_CLIENT_ID &&
              !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes("placeholder") &&
              !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes("your-google-client-id") &&
              !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes("your_google_client_id") ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  size="large"
                  text="continue_with"
                />
              ) : (
                <div
                  className="alert alert-warning text-center small py-2 px-3 mb-2 w-100 rounded"
                  style={{ fontSize: "0.8rem" }}
                  role="alert"
                >
                  Google Sign-In is currently unavailable. Please sign in with your email and password.
                </div>
              )}
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
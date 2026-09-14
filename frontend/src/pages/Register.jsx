import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

function Register() {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);

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
      setRegistrationSuccess(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus("");
    try {
      const res = await authService.resendVerification(email);
      setResendStatus(res.message || "Verification link resent successfully.");
    } catch (err) {
      setResendStatus(err.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
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
    setError(
      "Google Sign-In was unable to complete authorization. Please ensure popups are enabled, or create an account using your email and password below."
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-canvas)" }}>
      <Navbar />

      <main className="flex-1 d-flex align-items-center justify-content-center py-5">
        <div className="container" style={{ maxWidth: "480px" }}>
          <div className="saas-card shadow-lg p-4 p-md-5">
            {registrationSuccess ? (
              <div className="text-center py-3">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white mb-3"
                  style={{ width: "56px", height: "56px", backgroundColor: "var(--accent-primary, #2d5a4c)" }}
                >
                  <span style={{ fontSize: "1.8rem" }}>✉️</span>
                </div>
                <h3 className="fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Verify Your Email
                </h3>
                <p className="text-secondary small mb-3">
                  We've sent a single-use verification link to:
                </p>
                <div className="p-2 mb-4 rounded fw-semibold" style={{ backgroundColor: "var(--bg-surface-elevated)", color: "var(--accent-primary)" }}>
                  {email}
                </div>
                <p className="text-muted small mb-4">
                  Please click the link in your email to verify account ownership and enable clinical notifications.
                </p>

                {resendStatus && (
                  <div className="alert alert-info py-2 px-3 small rounded mb-3" role="alert">
                    {resendStatus}
                  </div>
                )}

                <div className="d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="btn btn-saas w-100"
                    onClick={() => redirectToDashboard(role)}
                  >
                    Continue to Dashboard
                  </button>
                  <button
                    type="button"
                    className="btn btn-saas-outline w-100"
                    onClick={handleResend}
                    disabled={resending}
                  >
                    {resending ? "Sending..." : "Resend Verification Email"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white mb-3"
                    style={{ width: "44px", height: "44px", background: "var(--accent-gradient)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
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
                    <label className="form-label-saas d-flex justify-content-between" htmlFor="role-select">
                      <span>Select Account Role</span>
                    </label>
                    <select
                      id="role-select"
                      className="form-control-saas"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="USER">User (Standard Access)</option>
                      <option value="SKINCARE_CONSULTANT">Skincare Consultant (Professional Review)</option>
                      <option value="DERMATOLOGIST">Dermatologist (Clinical Review)</option>
                      <option value="ADMIN">System Administrator (Full Platform Access)</option>
                    </select>
                    <small className="text-muted mt-1 d-block" style={{ fontSize: "0.75rem" }}>
                      {role === "USER" && "Standard user account: personalized routines, AI assessment, and progress tracking."}
                      {role === "SKINCARE_CONSULTANT" && "Consultant account: client collaboration, routine management, and consultations."}
                      {role === "DERMATOLOGIST" && "Dermatologist account: clinical triage, high-risk reviews, and specialist care."}
                      {role === "ADMIN" && "Administrator account: full telemetry, user management, and system audit logs."}
                    </small>
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

                <div className="d-flex flex-column align-items-center mb-4 w-100" style={{ overflow: "hidden" }}>
                  {import.meta.env.VITE_GOOGLE_CLIENT_ID &&
                  !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes("placeholder") &&
                  !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes("your-google-client-id") &&
                  !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes("your_google_client_id") ? (
                    <div
                      className="d-flex justify-content-center w-100"
                      style={{ maxWidth: "100%", position: "relative", minHeight: "44px" }}
                    >
                      {/* Visually Generic Google Button */}
                      <div
                        className="btn w-100 d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          maxWidth: "340px",
                          height: "44px",
                          backgroundColor: "var(--bg-surface, #ffffff)",
                          border: "1px solid var(--border-subtle, #dadce0)",
                          borderRadius: "24px",
                          fontWeight: 500,
                          fontSize: "0.95rem",
                          color: "var(--text-primary, #3c4043)",
                          pointerEvents: "none",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 48 48" className="me-2" style={{ flexShrink: 0 }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        <span>Sign up with Google</span>
                      </div>

                      {/* Active Google Identity Services Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          opacity: 0.0001,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer"
                        }}
                      >
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={handleGoogleError}
                          theme="outline"
                          shape="pill"
                          size="large"
                          width="340"
                          useOneTap={false}
                          auto_select={false}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="alert alert-warning text-center small py-2 px-3 mb-2 w-100 rounded"
                      style={{ fontSize: "0.8rem" }}
                      role="alert"
                    >
                      Google Sign-In is currently unavailable. Please create an account with your email and password.
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <span className="text-secondary small">Already have an account? </span>
                  <Link to="/login" className="text-primary small fw-semibold text-decoration-none">
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;

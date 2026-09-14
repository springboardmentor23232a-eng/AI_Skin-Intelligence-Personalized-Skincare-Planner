import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import authService from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(Boolean(token));
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(token ? "" : "No verification token provided in URL.");
  const [resendEmail, setResendEmail] = useState(user?.email || "");
  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const executeVerification = async () => {
      try {
        await authService.verifyEmail(token);
        if (isMounted) {
          setSuccess(true);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Invalid or expired verification link.");
          setSuccess(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    setResendStatus("");
    try {
      const res = await authService.resendVerification(resendEmail);
      setResendStatus(res.message || "A fresh verification email has been dispatched.");
    } catch (err) {
      setResendStatus(err.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "var(--bg-canvas)" }}>
      <Navbar />

      <main className="flex-1 d-flex align-items-center justify-content-center py-5">
        <div className="container" style={{ maxWidth: "480px" }}>
          <div className="saas-card shadow-lg p-4 p-md-5 text-center">
            {loading ? (
              <div className="py-4">
                <div className="spinner-border text-secondary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                  <span className="visually-hidden">Verifying...</span>
                </div>
                <h4 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Verifying Email Address</h4>
                <p className="text-secondary small">Cryptographically confirming your account ownership...</p>
              </div>
            ) : success ? (
              <div className="py-2">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white mb-3"
                  style={{ width: "60px", height: "60px", backgroundColor: "#10b981" }}
                >
                  <span style={{ fontSize: "2rem" }}>✓</span>
                </div>
                <h3 className="fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Email Verified Successfully!
                </h3>
                <p className="text-secondary small mb-4">
                  Your email identity has been verified. Transactional routine reminders, assessment updates, and clinical notifications are now unlocked.
                </p>
                <button
                  type="button"
                  className="btn btn-saas w-100"
                  onClick={() => navigate("/user")}
                >
                  Go to Your Workspace
                </button>
              </div>
            ) : (
              <div className="py-2">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white mb-3"
                  style={{ width: "60px", height: "60px", backgroundColor: "#ef4444" }}
                >
                  <span style={{ fontSize: "1.8rem" }}>⚠️</span>
                </div>
                <h4 className="fw-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Verification Link Invalid or Expired
                </h4>
                <p className="text-secondary small mb-4">
                  {error || "The link may have expired or already been used. Please request a new verification email below."}
                </p>

                {resendStatus && (
                  <div className="alert alert-info py-2 px-3 small rounded mb-3 text-start" role="alert">
                    {resendStatus}
                  </div>
                )}

                <form onSubmit={handleResend} className="text-start mb-3">
                  <div className="mb-3">
                    <label className="form-label-saas">Enter Your Email Address</label>
                    <input
                      type="email"
                      className="form-control-saas"
                      placeholder="name@example.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-saas w-100"
                    disabled={resending}
                  >
                    {resending ? "Dispatching..." : "Send New Verification Link"}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <Link to="/login" className="text-primary small fw-semibold text-decoration-none">
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                Access your AI Skin Intelligence workspace
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-6"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-10 pl-10 pr-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-10 pl-10 pr-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
              >
                {submitting ? "Signing in..." : "Sign In"} <ArrowRight size={14} />
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <span className="relative px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white dark:bg-slate-800">
                Or continue with
              </span>
            </div>

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                prompt="select_account"
                theme="outline"
                shape="rectangular"
                size="large"
                text="continue_with"
                width="100%"
              />
            </div>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-decoration-none"
              >
                Create Account
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Mode = "login" | "signup" | "forgot";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://applyflow-delta.vercel.app/reset-password",
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a password reset link.");
      }
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="navbar-logo" style={{ margin: "0 auto 16px" }}>
            AF
          </div>
          <h2>
            {mode === "login"
              ? "Welcome back"
              : mode === "signup"
              ? "Create account"
              : "Reset password"}
          </h2>
          <p>
            {mode === "login"
              ? "Sign in to your account"
              : mode === "signup"
              ? "Start tracking your applications"
              : "We'll send you a reset link"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">⚠ {error}</div>}
          {message && <div className="form-success">✓ {message}</div>}

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {mode !== "forgot" && (
            <div
              className="form-group"
              style={{ marginBottom: mode === "login" ? 8 : 24 }}
            >
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>
          )}

          {mode === "login" && (
            <div style={{ marginBottom: 24, textAlign: "right" }}>
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setMessage("");
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {mode === "forgot" && <div style={{ marginBottom: 24 }} />}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Sign In"
              : mode === "signup"
              ? "Create Account"
              : "Send Reset Link"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "forgot" ? (
            <>
              Remember it?{" "}
              <button
                className="auth-switch-btn"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
              >
                Sign in
              </button>
            </>
          ) : mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                className="auth-switch-btn"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setMessage("");
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="auth-switch-btn"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Auth;

import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage({ onLogin }) {
  // simple local state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // basic submit handler (swap for your real fetch/axios)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // minimal validation
    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }

    try {
      // fake login simulation (replace with your API)
      // const res = await fetch("/api/login", { method: "POST", body: JSON.stringify({ email, password }) });
      // const data = await res.json();

      // on success:
      onLogin?.({ email }); // optional: pass user data up to the app
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <main className="login-wrap">
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Login</h1>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-invalid={!!error && (!email || !password)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              aria-invalid={!!error && (!email || !password)}
            />
          </label>

          {!!error && (
            <p className="error-msg" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary">
            Sign in
          </button>
        </form>

        <p className="helper-text">
          Don’t have an account?
          <Link to="/signup"> Create one</Link>
        </p>
      </section>
    </main>
  );
}

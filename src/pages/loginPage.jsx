import { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage({ onLogin }) {
  // Local form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  // Feedback state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Generic change handler for inputs/checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Minimal email validation helper
  const isValidEmail = (str) => /\S+@\S+\.\S+/.test(str);

  // Submit handler (replace with your real API call)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in Email and Password.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      // Example (replace with your endpoint):
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {...});
      // const data = await res.json();
      // if (!res.ok) return setError(data?.message || "Invalid email or password.");

      onLogin(form); // notify parent/app
    } catch (err) {
      setError("Network error. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tm-login">
      <form className="tm-card" onSubmit={handleSubmit} noValidate>
        <h1 className="tm-title">Log In</h1>

        {/* Email */}
        <label className="tm-field">
          <span className="tm-label-text">Email</span>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
        </label>

        {/* Password */}
        <label className="tm-field">
          <span className="tm-label-text">Password</span>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
        </label>

        {/* Remember me */}
        <label className="tm-check">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
          />
          <span>Remember me</span>
        </label>

        {/* Error message */}
        {error && <p className="tm-error">{error}</p>}

        {/* Primary action */}
        <button className="tm-cta" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>

        {/* Helper */}
        <p className="tm-helper">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";
import axios from "axios";

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


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  if (!form.email || !form.password) {
    setError("Please fill in Email and Password.");
    return;
  }
  try {
    setLoading(true);
    const base = import.meta.env.VITE_API_URL;
    const res = await axios.post(`${base}/api/auth/login`, {
      email: form.email,
      password: form.password,
    });

    const { token, user } = res.data;
    if (!token) {
      setError("No token received from server.");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    onLogin(user);
    
  } catch (err) {
    setError(err.response?.data?.message || "Network error. Please try again.");
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

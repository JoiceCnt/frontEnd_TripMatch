import { useState } from "react";
import "./SignUpPage.css"; // Namespaced stylesheet

export default function SignUpPage({ onSubmitForm }) {
  // Form state for each field
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "", // <-- added email
    gender: "male",
    password: "",
    terms: false,
    marketing: false,
  });

  // Feedback messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Generic change handler for inputs, radios and checkboxes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Minimal email validation helper
  const isValidEmail = (str) => /\S+@\S+\.\S+/.test(str);

  // Submit handler (call your API here)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Minimal client-side validation
    if (!form.name || !form.surname || !form.email || !form.password) {
      setError("Please fill in Name, Surname, Email and Password.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!form.terms) {
      setError("You must accept the terms.");
      return;
    }

    try {
      // 👉 Replace this mock with your real API call
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });
      // if (!res.ok) throw new Error("Failed to create account");

      onSubmitForm?.(form); // optional: notify parent
      setSuccess("Account created successfully!");

      // Optionally reset the form
      // setForm({ name:"", surname:"", email:"", gender:"male", password:"", terms:false, marketing:false });
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    }
  };

  return (
    <div className="tm-signup">
      <form className="tm-card" onSubmit={handleSubmit} noValidate>
        <h1 className="tm-title">Sign Up</h1>

        {/* Name */}
        <label className="tm-field">
          <span className="tm-label-text">Name</span>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />
        </label>

        {/* Surname */}
        <label className="tm-field">
          <span className="tm-label-text">Surname</span>
          <input
            type="text"
            name="surname"
            placeholder="Surname"
            value={form.surname}
            onChange={handleChange}
          />
        </label>

        {/* Email (added after Surname) */}
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

        {/* Gender radios */}
        <fieldset className="tm-gender">
          <legend>Gender:</legend>

          <label className="tm-radio">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={form.gender === "male"}
              onChange={handleChange}
            />
            <span>Male</span>
          </label>

          <label className="tm-radio">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={form.gender === "female"}
              onChange={handleChange}
            />
            <span>Female</span>
          </label>
        </fieldset>

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

        {/* Terms checkbox */}
        <label className="tm-check">
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
          />
          <span>Accept terms and conditions without reading</span>
        </label>

        {/* Marketing checkbox */}
        <label className="tm-check">
          <input
            type="checkbox"
            name="marketing"
            checked={form.marketing}
            onChange={handleChange}
          />
          <span>
            Send me emails and notifications that I will delete and never open
          </span>
        </label>

        {/* Feedback messages */}
        {error && <p className="tm-error">{error}</p>}
        {success && <p className="tm-success">{success}</p>}

        {/* Primary action */}
        <button className="tm-cta" type="submit" aria-label="Create an Account">
          Create an Account
        </button>
      </form>
    </div>
  );
}

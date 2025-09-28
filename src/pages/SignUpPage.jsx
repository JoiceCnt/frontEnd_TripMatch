// src/pages/SignUpPage.jsx
import { useState } from "react";
import "./SignUpPage.css"; 
import axios from "axios";

export default function SignUpPage({ onSubmitForm }) {
  // Campos do formulário (inclui os do ProfilePage)
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    gender: "male",
    password: "",
    terms: false,
    marketing: false,

    // ----- novos / alinhados ao ProfilePage -----
    bio: "",
    favoriteCities: "",
    preferences: {
      nature: false,
      concerts_and_events: false,
      gastronomy: false,
      touristic_places: false,
    },
  });

  // Foto (arquivo e preview local)
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // Feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handler genérico para inputs text/email/password/radio/checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Se for um dos checkboxes de preferences
    if (
      name === "nature" ||
      name === "concerts_and_events" ||
      name === "gastronomy" ||
      name === "touristic_places"
    ) {
      setForm((f) => ({
        ...f,
        preferences: {
          ...f.preferences,
          [name]: type === "checkbox" ? checked : value,
        },
      }));
      return;
    }

    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Foto: selecionar + preview
  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview("");
  };

  // Email básico
  const isValidEmail = (str) => /\S+@\S+\.\S+/.test(str);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validações mínimas
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in Name, Email and Password.");
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
      // Se o backend aceitar upload de imagem no signup, use FormData:
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("surname", form.surname);
      fd.append("email", form.email);
      fd.append("gender", form.gender);
      fd.append("password", form.password);
      fd.append("terms", String(form.terms));
      fd.append("marketing", String(form.marketing));

      // Campos do "Profile"
      fd.append("bio", form.bio);
      fd.append("favoriteCities", form.favoriteCities);
      fd.append("preferences", JSON.stringify(form.preferences));
      if (photoFile) fd.append("photo", photoFile);

      // 👉 Substitua pelo seu endpoint real quando quiser conectar:
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
      //   method: "POST",
      //   body: fd,
      // });
      // if (!res.ok) throw new Error("Failed to create account");
      // const data = await res.json();

      // Avisar o pai (sem quebrar quem já usa onSubmitForm)
      onSubmitForm?.({
        ...form,
        hasPhoto: Boolean(photoFile),
      });
      const response = await axios.post(
        "http://localhost:5005/api/auth/register",
        form
      );
      console.log(response);
      setSuccess("Account created successfully!");

      // (Opcional) Resetar formulário
      // setForm({
      //   name: "", surname: "", email: "", gender: "male", password: "",
      //   terms: false, marketing: false, bio: "", favoriteCities: "",
      //   preferences: { nature:false, concerts_and_events:false, gastronomy:false, touristic_places:false }
      // });
      // setPhotoFile(null);
      // setPhotoPreview("");
    } catch (err) {
      console.log(err);
      setError(err?.message || "Something went wrong.");
    }
  };

  return (
    <div className="tm-signup">
      <form className="tm-card" onSubmit={handleSubmit} noValidate>
        <h1 className="tm-title">Sign Up</h1>

        {/* Foto (preview + controles) */}
        <div className="tm-photo">
          <div className="tm-photo__preview">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile preview" />
            ) : (
              <div className="tm-photo__placeholder">No photo</div>
            )}
          </div>

          <div className="tm-photo__controls">
            <label className="tm-btn">
              Upload photo
              <input
                type="file"
                accept="image/*"
                onChange={onPickPhoto}
                hidden
              />
            </label>
            {photoPreview && (
              <button
                type="button"
                className="tm-btn tm-btn--ghost"
                onClick={clearPhoto}
              >
                Remove
              </button>
            )}
          </div>
        </div>

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

        {/* Surname (opcional) */}
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

        {/* Bio */}
        <label className="tm-field">
          <span className="tm-label-text">Bio</span>
          <textarea
            rows={4}
            name="bio"
            placeholder="Tell people about you..."
            value={form.bio}
            onChange={handleChange}
          />
        </label>

        {/* Preferences (alinhado ao ProfilePage) */}
        <fieldset className="tm-fieldset">
          <legend>Travel preferences</legend>

          <label className="tm-check">
            <input
              type="checkbox"
              name="nature"
              checked={form.preferences.nature}
              onChange={handleChange}
            />
            <span>Nature</span>
          </label>

          <label className="tm-check">
            <input
              type="checkbox"
              name="concerts_and_events"
              checked={form.preferences.concerts_and_events}
              onChange={handleChange}
            />
            <span>Concerts & Events</span>
          </label>

          <label className="tm-check">
            <input
              type="checkbox"
              name="gastronomy"
              checked={form.preferences.gastronomy}
              onChange={handleChange}
            />
            <span>Gastronomy</span>
          </label>

          <label className="tm-check">
            <input
              type="checkbox"
              name="touristic_places"
              checked={form.preferences.touristic_places}
              onChange={handleChange}
            />
            <span>Touristic places</span>
          </label>
        </fieldset>

        {/* Favorite cities */}
        <label className="tm-field">
          <span className="tm-label-text">
            Favorite cities (comma-separated)
          </span>
          <input
            type="text"
            name="favoriteCities"
            placeholder="Barcelona, Lisbon, Rome"
            value={form.favoriteCities}
            onChange={handleChange}
          />
        </label>

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

        {/* Gender */}
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

        {/* Terms */}
        <label className="tm-check">
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
          />
          <span>Accept terms and conditions without reading</span>
        </label>

        {/* Marketing */}
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

        {/* Feedback */}
        {error && <p className="tm-error">{error}</p>}
        {success && <p className="tm-success">{success}</p>}

        {/* CTA */}
        <button className="tm-cta" type="submit" aria-label="Create an Account">
          Create an Account
        </button>
      </form>
    </div>
  );
}

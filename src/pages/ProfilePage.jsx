import { useEffect, useState } from "react";
import "./ProfilePage.css";

/**
 * Profile Page
 * - Edit basic info (name, bio)
 * - Upload / preview profile picture
 * - Travel preferences (same enums you used in your Trip model)
 * - Favorite cities (comma-separated)
 *
 * TODO: Replace the mock save with your real API (fetch/axios).
 */
export default function ProfilePage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [preferences, setPreferences] = useState({
    nature: false,
    concerts_and_events: false,
    gastronomy: false,
    touristic_places: false,
  });
  const [favoriteCities, setFavoriteCities] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. Obtener datos del usuario al montar ---
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:5005/api/users/me", {
          credentials: "include", // si usas cookies/sesión
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Error fetching profile");
        const data = await res.json();

        // Rellenamos los estados
        setName(data.name || "");
        setBio(data.bio || "");
        setPreferences(data.preferences || {});
        setFavoriteCities(data.favoriteCities || "");
        if (data.photoUrl) setPhotoPreview(data.photoUrl);

        setLoading(false);
      } catch (err) {
        console.error("❌ Error cargando perfil:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  // Handle photo file selection + preview
  function onPickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview("");
  }

  function togglePref(key) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Prepare payload (FormData if sending image to backend)
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("favoriteCities", favoriteCities);
    formData.append("preferences", JSON.stringify(preferences));
    if (photoFile) formData.append("photo", photoFile);

    try {
        const res = await fetch("http://localhost:3000/api/users/me", {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save profile");

      const data = await res.json();
      alert("✅ Profile saved!");

      // opcional: refrescar el preview desde backend
      if (data.photoUrl) setPhotoPreview(data.photoUrl);
    } catch (err) {
      console.error("❌ Error guardando perfil:", err);
      alert("Failed to savev profile.");
    }
  }

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <main className="tm-profile">
      <section className="tm-card">
        <h1 className="tm-title">Your Profile</h1>

        <form className="tm-form" onSubmit={handleSubmit}>
          {/* Photo */}
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

          {/* Basic info */}
          <label className="tm-field">
            <span>Name</span>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="tm-field">
            <span>Bio</span>
            <textarea
              rows={4}
              placeholder="Tell people about you..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          {/* Travel preferences (match your enum) */}
          <fieldset className="tm-fieldset">
            <legend>Travel preferences</legend>
            <label className="tm-check">
              <input
                type="checkbox"
                checked={preferences.nature}
                onChange={() => togglePref("nature")}
              />
              <span>Nature</span>
            </label>
            <label className="tm-check">
              <input
                type="checkbox"
                checked={preferences.concerts_and_events}
                onChange={() => togglePref("concerts_and_events")}
              />
              <span>Concerts & Events</span>
            </label>
            <label className="tm-check">
              <input
                type="checkbox"
                checked={preferences.gastronomy}
                onChange={() => togglePref("gastronomy")}
              />
              <span>Gastronomy</span>
            </label>
            <label className="tm-check">
              <input
                type="checkbox"
                checked={preferences.touristic_places}
                onChange={() => togglePref("touristic_places")}
              />
              <span>Touristic places</span>
            </label>
          </fieldset>

          {/* Favorite cities */}
          <label className="tm-field">
            <span>Favorite cities (comma-separated)</span>
            <input
              type="text"
              placeholder="Barcelona, Lisbon, Rome"
              value={favoriteCities}
              onChange={(e) => setFavoriteCities(e.target.value)}
            />
          </label>

          <div className="tm-actions">
            <button type="submit" className="tm-btn tm-btn--primary">
              Save profile
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

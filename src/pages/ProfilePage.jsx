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

  // Example: hydrate from API/localStorage
  useEffect(() => {
    // TODO: fetch("/api/users/me") and set state with the response
    // For now, try to load a saved theme/photo from localStorage (optional)
    const saved = JSON.parse(localStorage.getItem("profileDraft") || "{}");
    if (saved.name) setName(saved.name);
    if (saved.bio) setBio(saved.bio);
    if (saved.preferences) setPreferences(saved.preferences);
    if (saved.favoriteCities) setFavoriteCities(saved.favoriteCities);
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
      // TODO: replace with your real endpoint + auth header
      // const res = await fetch("/api/users/me", { method: "PUT", body: formData });
      // const data = await res.json();

      // Mock success: also keep a draft locally
      localStorage.setItem(
        "profileDraft",
        JSON.stringify({ name, bio, preferences, favoriteCities })
      );
      alert("Profile saved! (mock)");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    }
  }

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

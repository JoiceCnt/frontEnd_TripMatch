// src/pages/SettingsPage.jsx
import { useEffect, useState } from "react";
import "./SettingsPage.css";

export default function SettingsPage() {
  // Theme
  const [dark, setDark] = useState(false);

  // Language
  const [lang, setLang] = useState("en");

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);

  // Privacy
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [postVisibility, setPostVisibility] = useState("everyone"); // everyone | friends | private

  // Security
  const [twoFA, setTwoFA] = useState(false);
  const [currPwd, setCurrPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");

  // Hydrate from localStorage (simples; troque por GET /api/users/me/settings)
   useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("http://localhost:5005/api/users/me/settings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"), // si usas JWT
          },
        });
        if (!res.ok) throw new Error("Error loading settings");
        const data = await res.json();

        setDark(data.theme === "dark");
        document.documentElement.dataset.theme = data.theme || "light";

        setLang(data.lang || "en");
        setEmailNotif(data.emailNotif ?? true);
        setInAppNotif(data.inAppNotif ?? true);
        setIsPublicProfile(data.isPublicProfile ?? true);
        setPostVisibility(data.postVisibility || "everyone");
        setTwoFA(data.twoFA ?? false);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }

    loadSettings();
  }, []);

  // Apply theme immediately
  useEffect(() => {
    const value = dark ? "dark" : "light";
    document.documentElement.dataset.theme = value;
    localStorage.setItem("theme", value);
  }, [dark]);

  async function saveSettings() {
    try {
      const body = {
        theme: dark ? "dark" : "light",
        lang,
        emailNotif,
        inAppNotif,
        isPublicProfile,
        postVisibility,
        twoFA,
      };

      const res = await fetch("http://localhost:3000/api/users/me/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      alert("Settings saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (!currPwd || !newPwd || newPwd !== newPwd2) {
      alert("Check your passwords (they must match).");
      return;
    }
    try {
       const res = await fetch("http://localhost:3000/api/users/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ currPwd, newPwd }),
      });

      if (!res.ok) throw new Error("Failed to change password");

      setCurrPwd("");
      setNewPwd("");
      setNewPwd2("");
      alert("Password changed!");
    } catch (err) {
      console.error(err);
      alert("Failed to change password.");
    }
  }

  return (
    <main className="tm-settings">
      <section className="tm-card">
        <h1 className="tm-title">Settings</h1>

        {/* THEME */}
        <div className="tm-row">
          <span>Dark mode</span>
          <label className="tm-switch">
            <input
              type="checkbox"
              checked={dark}
              onChange={(e) => setDark(e.target.checked)}
            />
            <i />
          </label>
        </div>

        {/* LANGUAGE */}
        <div className="tm-row">
          <label className="tm-field">
            <span>Language</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="es">Español</option>
            </select>
          </label>
        </div>

        {/* NOTIFICATIONS */}
        <fieldset className="tm-fieldset">
          <legend>Notifications</legend>
          <label className="tm-check">
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={() => setEmailNotif((v) => !v)}
            />
            <span>Email alerts</span>
          </label>
          <label className="tm-check">
            <input
              type="checkbox"
              checked={inAppNotif}
              onChange={() => setInAppNotif((v) => !v)}
            />
            <span>In-app notifications</span>
          </label>
        </fieldset>

        {/* PRIVACY */}
        <fieldset className="tm-fieldset">
          <legend>Privacy</legend>
          <label className="tm-check">
            <input
              type="checkbox"
              checked={isPublicProfile}
              onChange={() => setIsPublicProfile((v) => !v)}
            />
            <span>Public profile</span>
          </label>

          <div className="tm-field tm-field--inline">
            <span>Who can see my posts?</span>
            <div className="tm-radios">
              <label className="tm-radio">
                <input
                  type="radio"
                  name="vis"
                  value="everyone"
                  checked={postVisibility === "everyone"}
                  onChange={(e) => setPostVisibility(e.target.value)}
                />
                <span>Everyone</span>
              </label>
              <label className="tm-radio">
                <input
                  type="radio"
                  name="vis"
                  value="friends"
                  checked={postVisibility === "friends"}
                  onChange={(e) => setPostVisibility(e.target.value)}
                />
                <span>Friends</span>
              </label>
              <label className="tm-radio">
                <input
                  type="radio"
                  name="vis"
                  value="private"
                  checked={postVisibility === "private"}
                  onChange={(e) => setPostVisibility(e.target.value)}
                />
                <span>Only me</span>
              </label>
            </div>
          </div>
        </fieldset>

        {/* SECURITY */}
        <fieldset className="tm-fieldset">
          <legend>Security</legend>
          <label className="tm-check">
            <input
              type="checkbox"
              checked={twoFA}
              onChange={() => setTwoFA((v) => !v)}
            />
            <span>Two-factor authentication (2FA)</span>
          </label>

          <form className="tm-pass" onSubmit={changePassword}>
            <label className="tm-field">
              <span>Current password</span>
              <input
                type="password"
                value={currPwd}
                onChange={(e) => setCurrPwd(e.target.value)}
              />
            </label>
            <label className="tm-field">
              <span>New password</span>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
              />
            </label>
            <label className="tm-field">
              <span>Confirm new password</span>
              <input
                type="password"
                value={newPwd2}
                onChange={(e) => setNewPwd2(e.target.value)}
              />
            </label>
            <div className="tm-actions">
              <button className="tm-btn tm-btn--primary" type="submit">
                Change password
              </button>
            </div>
          </form>
        </fieldset>

        <div className="tm-actions">
          <button className="tm-btn tm-btn--primary" onClick={saveSettings}>
            Save settings
          </button>
        </div>
      </section>
    </main>
  );
}

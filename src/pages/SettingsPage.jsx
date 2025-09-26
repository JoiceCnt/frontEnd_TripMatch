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
    const theme = localStorage.getItem("theme") || "light";
    setDark(theme === "dark");
    document.documentElement.dataset.theme = theme;

    setLang(localStorage.getItem("lang") || "en");
    setEmailNotif(JSON.parse(localStorage.getItem("emailNotif") ?? "true"));
    setInAppNotif(JSON.parse(localStorage.getItem("inAppNotif") ?? "true"));
    setIsPublicProfile(
      JSON.parse(localStorage.getItem("isPublicProfile") ?? "true")
    );
    setPostVisibility(localStorage.getItem("postVisibility") || "everyone");
    setTwoFA(JSON.parse(localStorage.getItem("twoFA") ?? "false"));
  }, []);

  // Apply theme immediately
  useEffect(() => {
    const value = dark ? "dark" : "light";
    document.documentElement.dataset.theme = value;
    localStorage.setItem("theme", value);
  }, [dark]);

  function saveSettings() {
    // TODO: enviar para backend (PUT /api/users/me/settings)
    localStorage.setItem("lang", lang);
    localStorage.setItem("emailNotif", JSON.stringify(emailNotif));
    localStorage.setItem("inAppNotif", JSON.stringify(inAppNotif));
    localStorage.setItem("isPublicProfile", JSON.stringify(isPublicProfile));
    localStorage.setItem("postVisibility", postVisibility);
    localStorage.setItem("twoFA", JSON.stringify(twoFA));
    alert("Settings saved!");
  }

  async function changePassword(e) {
    e.preventDefault();
    if (!currPwd || !newPwd || newPwd !== newPwd2) {
      alert("Check your passwords (they must match).");
      return;
    }
    try {
      // TODO: await fetch("/api/users/me/password", { method:"PUT", headers:{...}, body:JSON.stringify({currPwd,newPwd}) })
      setCurrPwd("");
      setNewPwd("");
      setNewPwd2("");
      alert("Password changed! (mock)");
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

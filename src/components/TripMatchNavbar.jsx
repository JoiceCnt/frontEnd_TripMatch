import React from "react";
import { NavLink } from "react-router-dom";
import "./TripMatchNavbar.css";

export default function TripMatchNavbar({
  variant = "home", // "home" shows big Log In; "internal" shows icon/avatar
  isLoggedIn = false, // when true (internal), shows avatar/icon
  onLoginClick = () => {}, // called when Log In is clicked
  avatarUrl, // optional user photo
}) {
  return (
    <header className="tm-nav" role="banner">
      <div className="tm-nav__inner">
        {/* Left: brand/logo link */}
        <NavLink to="/" className="tm-logo" aria-label="Trip Match Home">
          <LogoMark />
          <span className="tm-logo__text">
            <strong>Trip</strong> <span>Match</span>
          </span>
        </NavLink>

        {/* Center: main navigation pills */}
        <nav className="tm-center" aria-label="Primary">
          <NavPill to="/activities">Activities</NavPill>
          <NavPill to="/stories">Member Stories</NavPill>
          <NavPill to="/feed">Feed</NavPill>
          <NavPill to="/itinerary">Itinerary</NavPill>
        </nav>

        {/* Right: auth area */}
        <div className="tm-right">
          {variant === "home" ? (
            // Homepage: large Log In button
            <button className="tm-login" onClick={onLoginClick} type="button">
              Log In
            </button>
          ) : isLoggedIn ? (
            // Internal + logged in: avatar/icon
            <button className="tm-avatar" type="button" aria-label="Account">
              {avatarUrl ? <img src={avatarUrl} alt="" /> : <UserIcon />}
            </button>
          ) : (
            // Internal + not logged: small login icon that routes to /login
            <NavLink
              to="/login"
              className="tm-login--small"
              aria-label="Log In"
            >
              <KeyIcon />
            </NavLink>
          )}
        </div>
      </div>

      {/* Optional soft shadow under the bar */}
      <div className="tm-shadow" />
    </header>
  );
}

/* Reusable NavLink pill with active style */
function NavPill({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `tm-pill ${isActive ? "is-active" : ""}`}
    >
      {children}
    </NavLink>
  );
}

/* Inline SVGs without image files */
function LogoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C8.134 2 5 5.134 5 9c0 5 7 13 7 13s7-8 7-13c0-3.866-3.134-7-7-7Z"
        fill="#0E2B2C"
      />
      <circle cx="12" cy="9" r="3.2" fill="#FFFFFF" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="#FFFFFF" strokeWidth="1.5" />
      <path
        d="M4 20c1.8-3.5 5-5.5 8-5.5s6.2 2 8 5.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="10" r="4" stroke="#FFFFFF" strokeWidth="1.5" />
      <path
        d="M12 10h9m-4 0v3m-3-3v2"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

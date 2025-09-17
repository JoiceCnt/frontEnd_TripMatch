// src/components/TripMatchNavbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./TripMatchNavbar.css"; // << CSS separado

export default function TripMatchNavbar({
  variant = "home",
  isAuthenticated = false,
  onLoginClick,
  onLogout,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const goProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const doLogout = () => {
    setOpen(false);
    onLogout?.();
    navigate("/");
  };

  const linkClass = ({ isActive }) => `tm-navbtn${isActive ? " active" : ""}`;

  return (
    <header className="tm-navbar" role="banner" aria-label="Primary">
      {/* Left: brand */}
      <button
        className="tm-brand"
        onClick={() => navigate("/")}
        aria-label="Home"
      >
        <img src="/icons/pin-dark.svg" alt="" className="tm-brand-pin" />
        <span className="tm-brand-name">
          <strong>Trip</strong>&nbsp;Match
        </span>
      </button>

      {/* Center: nav buttons */}
      <nav className="tm-nav" aria-label="Main navigation">
        <NavLink to="/activities" className={linkClass}>
          Activities
        </NavLink>
        <NavLink to="/stories" className={linkClass}>
          Member Stories
        </NavLink>
        <NavLink to="/feed" className={linkClass}>
          Feed
        </NavLink>
        <NavLink to="/itinerary" className={linkClass}>
          Itinerary
        </NavLink>
      </nav>

      {/* Right: auth */}
      <div className="tm-auth">
        {!isAuthenticated && variant === "home" ? (
          <button
            className="tm-login-btn"
            onClick={onLoginClick}
            aria-label="Log in"
          >
            Log In
          </button>
        ) : (
          <div className="tm-user" ref={menuRef}>
            <button
              className="tm-avatar-btn"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <img src="/icons/user-dark.svg" alt="" />
            </button>

            {open && (
              <div className="tm-menu" role="menu">
                <button
                  className="tm-menu-item"
                  role="menuitem"
                  onClick={goProfile}
                >
                  Profile
                </button>
                <button
                  className="tm-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    navigate("/settings");
                  }}
                >
                  Settings
                </button>
                <hr className="tm-menu-sep" />
                <button
                  className="tm-menu-item tm-danger"
                  role="menuitem"
                  onClick={doLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

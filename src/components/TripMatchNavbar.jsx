import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function TripMatchNavbar({
  variant = "home", // "home" shows the big Log In button
  isAuthenticated = false, // when true, show avatar + dropdown
  onLoginClick, // handler for Log In (home)
  onLogout, // handler for Log out
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // dropdown open/close
  const menuRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Small helper actions
  const goProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const doLogout = () => {
    setOpen(false);
    onLogout?.(); // parent clears auth/session
    navigate("/"); // optional: back to home
  };

  return (
    <header className="tm-navbar" role="banner" aria-label="Primary">
      {/* Left: brand */}
      <div className="tm-brand" onClick={() => navigate("/")}>
        <img src="/icons/pin-dark.svg" alt="" className="tm-brand-pin" />
        <span className="tm-brand-name">
          <strong>Trip</strong>&nbsp;Match
        </span>
      </div>

      {/* Center: nav buttons */}
      <nav className="tm-nav" aria-label="Main navigation">
        <NavLink className="tm-navbtn" to="/activities">
          Activities
        </NavLink>
        <NavLink className="tm-navbtn" to="/stories">
          Member Stories
        </NavLink>
        <NavLink className="tm-navbtn" to="/feed">
          Feed
        </NavLink>
        <NavLink className="tm-navbtn" to="/itinerary">
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
            {/* Avatar button opens the dropdown */}
            <button
              className="tm-avatar-btn"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <img src="/icons/user-dark.svg" alt="" />
            </button>

            {/* Dropdown menu */}
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

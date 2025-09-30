// src/components/TripMatchNavbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./TripMatchNavbar.css";

export default function TripMatchNavbar({
  variant = "home",
  isAuthenticated = false,
  user = {}, // <── Novo: recebemos user
  onLoginClick,
  onLogout,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  console.log("User in Navbar:", user);
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
  console.log("Navbar user:", user);
  return (
    <header className="tm-navbar" role="banner" aria-label="Primary">
      {/* Left: brand */}
      <button
        className="tm-brand"
        onClick={() => navigate("/")}
        aria-label="Home"
      >
        <img
          src="/images/tripmatch-logo.png"
          alt="Trip Match logo"
          className="tm-brand-pin"
        />
      </button>

      {/* Center: nav buttons */}
      <nav className="tm-nav" aria-label="Main navigation">
        <NavLink to="/feed" className={linkClass}>
          Feed
        </NavLink>
        <NavLink to="/trips" className={linkClass}>
          Trips
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
          <div className="tm-avatar-wrapper" ref={menuRef}>
            <button
              className="tm-avatar-btn"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <img
                src={
                  user.photo ||
                  "https://raw.githubusercontent.com/feathericons/feather/master/icons/user.svg"
                }
                alt="User avatar"
                className="tm-avatar-img"
              />
            </button>
            <span className="tm-hello">Hello, {user.name || "Traveler"}!</span>

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

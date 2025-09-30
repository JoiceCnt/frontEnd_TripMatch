// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import TripMatchNavbar from "./components/TripMatchNavbar";
import TripMatchFooter from "./components/tripMatchFooter";

import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import PolicyPage from "./pages/PolicyPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage";
import TripsPage from "./pages/TripsPage";
import Feed from "./pages/Feed";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage.jsx";

import "./App.css";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ photo: "" });

  const isHome = location.pathname === "/";

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser({ photo: "" });
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="tm-app">
      <TripMatchNavbar
        variant={isHome ? "home" : "internal"}
        isAuthenticated={isLoggedIn}
        user={user} // <── passa o objeto inteiro
        onLoginClick={() => navigate("/login")}
        onLogout={handleLogout}
      />

      <main className="tm-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <LoginPage
                onLogin={(user) => {
                  setIsLoggedIn(true);
                  setUser(user);
                  navigate("/");
                }}
              />
            }
          />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/trips" element={<TripsPage user={user} />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="*"
            element={<h1 style={{ padding: 24 }}>Not Found</h1>}
          />
        </Routes>
      </main>
      <TripMatchFooter />
    </div>
  );
}

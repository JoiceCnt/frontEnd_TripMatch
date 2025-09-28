// src/App.jsx
import { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import TripMatchNavbar from "./components/TripMatchNavbar";
import TripMatchFooter from "./components/tripMatchFooter";

import HomePage from "./pages/HomePage";
import ContactPage from "./pages/ContactPage";
import PolicyPage from "./pages/PolicyPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import TripsPage from "./pages/TripsPage";
import Feed from "./pages/Feed";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage.jsx";

import "./App.css";
import axios from "axios";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ photo: "" });

  const isHome = location.pathname === "/";

  const handleLogin = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:5005/api/auth/login",
        userData
      );
      setIsLoggedIn(true);
      console.log("userlogedin", response);
      localStorage.setItem("authToken", response.data.token);
      setUser(response.data.user);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser({ photo: "" });
    navigate("/");
  };

  return (
    <div className="tm-app">
      <TripMatchNavbar
        variant={isHome ? "home" : "internal"}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => navigate("/login")}
        onLogout={handleLogout}
        avatarUrl={user?.photo}
      />

      <main className="tm-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
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

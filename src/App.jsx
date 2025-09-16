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

import "./App.css"; // garante .tm-app / .tm-main

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // auth (simples; troque pelo seu fluxo real depois)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ photo: "" });

  const isHome = location.pathname === "/";

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData || { photo: "" });
    navigate("/"); // opcional
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser({ photo: "" });
    navigate("/");
  };

  return (
    <div className="tm-app">
      {/* NAVBAR fixo no topo */}
      <TripMatchNavbar
        variant={isHome ? "home" : "internal"}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => navigate("/login")}
        onLogout={handleLogout}
        avatarUrl={user?.photo}
      />

      {/* CONTEÚDO – empurra o footer para baixo */}
      <main className="tm-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* opcional: rota 404 */}
          {/* <Route path="*" element={<h1 style={{ padding: 24 }}>Not Found</h1>} /> */}
        </Routes>
      </main>

      {/* FOOTER (remova se não usar) */}
      <TripMatchFooter />
    </div>
  );
}

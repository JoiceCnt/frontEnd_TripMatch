import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import TripMatchNavbar from "./components/TripMatchNavbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Home usa o botão grande; demais páginas usam o ícone
  const isHome = location.pathname === "/";

  // Exemplo simples de “usuário logado”
  const isLoggedIn = false; // troque depois por seu estado real
  const user = { photo: "" }; // opcional

  return (
    <>
      <TripMatchNavbar
        variant={isHome ? "home" : "internal"}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => navigate("/login")}
        avatarUrl={user.photo}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={<LoginPage onLogin={(user) => console.log(user)} />}
        />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </>
  );
}

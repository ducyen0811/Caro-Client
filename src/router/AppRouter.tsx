import { Route, Routes } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import LobbyPage from "../pages/LobbyPage";
import MatchPage from "../pages/MatchPage";
import RegisterPage from "../pages/RegisterPage";

export default function AppRouter() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pb-10 pt-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/match/:matchId" element={<MatchPage />} />
        </Routes>
      </main>
    </div>
  );
}
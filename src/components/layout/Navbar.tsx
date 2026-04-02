import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { to: "/", label: "Trang chủ" },
    { to: "/lobby", label: "Lobby" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-galaxy-950/80 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 to-blue-600 font-black text-black">
            C
          </div>

          <div>
            <div className="text-sm font-bold text-white">Caro Galaxy</div>
            <div className="text-xs text-slate-400">Chơi caro qua mạng</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-sky-400/15 text-sky-200"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">{user?.username}</span>
            <button
              onClick={logout}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
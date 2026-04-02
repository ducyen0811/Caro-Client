import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { to: "/", label: "Trang chủ" },
    { to: "/lobby", label: "Phòng đấu" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-galaxy-950/70 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 to-blue-600 font-black text-galaxy-950 shadow-glow">
            C
          </div>

          <div>
            <div className="text-sm font-bold tracking-wide text-white">
              Caro Galaxy
            </div>
            <div className="text-xs text-slate-400">
              Realtime PvP • Elo Ranking
            </div>
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

        <div className="flex items-center gap-3">
          <Link
            to="/lobby"
            className="hidden rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] md:inline-flex"
          >
            Tìm trận nhanh
          </Link>

          {isAuthenticated ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-slate-400">{user?.username}</p>
                <p className="text-sm font-semibold text-white">
                  Elo {user?.elo ?? 1000}
                </p>
              </div>

              <button onClick={logout} className="btn-ghost hidden md:inline-flex">
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-ghost hidden md:inline-flex">
              Đăng Nhập Ngay
            </Link>
          )}

          <div className="h-10 w-10 rounded-full border border-white/10 bg-gradient-to-br from-blue-400/70 to-cyan-300/70" />
        </div>
      </div>
    </header>
  );
}
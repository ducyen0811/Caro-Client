import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="glass-panel p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
            Caro Online
          </p>

          <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
            caro qua mạng
          </h1>

          <p className="mt-5 text-slate-300">
            {isAuthenticated
              ? `Xin chào ${user?.username}, vào chơi luôn nhé.`
              : "Đồ Án Lập Trình Mạng"}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/lobby"
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-white"
                >
                  Chơi ngay
                </Link>

                <Link
                  to="/lobby"
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Tìm trận
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-white"
              >
                Đăng nhập ngay
              </Link>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="glass-panel p-5">
            <h2 className="text-white font-bold">Tìm trận</h2>
            <p className="text-slate-300">Ghép ngẫu nhiên</p>
          </div>

          <div className="glass-panel p-5">
            <h2 className="text-white font-bold">Phòng riêng</h2>
            <p className="text-slate-300">Chơi với bạn</p>
          </div>

          <div className="glass-panel p-5">
            <h2 className="text-white font-bold">Điểm</h2>
            <p className="text-slate-300">Hiển thị trực tiếp</p>
          </div>
        </section>
      </div>
    </div>
  );
}
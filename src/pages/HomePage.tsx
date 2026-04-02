import { Link } from "react-router-dom";
import BoardPreview from "../components/game/BoardPreview";
import LeaderboardPreview from "../components/ranking/LeaderboardPreview";
import SectionTitle from "../components/ui/SectionTitle";
import StatCard from "../components/ui/StatCard";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="page-shell space-y-10">
      <section className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-8 sm:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
            Galaxy Blue Interface
          </p>

          <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
            Caro online
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Đây là dự án cá nhân để học và thử nghiệm công nghệ. Mục tiêu chính
            là hoàn thiện một giao diện đẹp, mượt mà và dễ sử dụng cho game caro
            online, sau đó mới đến phần backend và realtime socket. Mình sẽ cập
            nhật tiến độ thường xuyên trên GitHub, mọi người có thể theo dõi và
            góp ý nhé!
          </p>

          {isAuthenticated ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/lobby"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-semibold text-white shadow-glow transition hover:scale-[1.02]"
              >
                Tìm trận nhanh
              </Link>

              <Link to="/lobby" className="btn-ghost">
                Vào phòng đấu
              </Link>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                Xin chào,{" "}
                <span className="ml-1 font-semibold text-white">
                  {user?.username}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login" className="btn-primary">
                Đăng nhập ngay
              </Link>

              <Link to="/lobby" className="btn-ghost">
                Xem phòng đấu
              </Link>
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard label="Mode" value="1v1" hint="Realtime socket" />
            <StatCard label="Ranking" value="Elo" hint="Chuẩn game đối kháng" />
            <StatCard label="Chat" value="Live" hint="Theo trận và lobby" />
          </div>
        </div>

        <BoardPreview />
      </section>

      <section>
        <SectionTitle
          eyebrow="Overview"
          title="Tổng quan dự án"
          description="Dự án này sẽ tập trung vào việc xây dựng một giao diện người dùng đẹp mắt và thân thiện cho game caro online, với các tính năng như phòng đấu, trận đấu trực tiếp, bảng xếp hạng Elo và hệ thống chat. Backend và phần realtime sẽ được phát triển sau khi giao diện hoàn chỉnh."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <LeaderboardPreview />

          <div className="glass-panel p-6">
            <p className="text-sm font-semibold text-white">Các màn chính</p>

            <div className="mt-4 grid gap-3">
              {[
                "Trang chủ",
                "Đăng nhập / đăng ký",
                "Lobby / danh sách phòng",
                "Match room / bàn cờ",
                "Profile / Elo / lịch sử đấu",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
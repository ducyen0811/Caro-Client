import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithToken, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorText("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      loginWithToken(res.data.accessToken, res.data.user);
      navigate("/", { replace: true });
    } catch (error: any) {
      setErrorText(
        error?.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-md glass-panel p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
          Welcome back
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">Đăng nhập</h1>

        <p className="mt-2 text-sm text-slate-400">
          Đăng nhập để chơi Caro online.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              className="input-galaxy"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Mật khẩu
            </label>
            <input
              className="input-galaxy"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorText && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {errorText}
            </div>
          )}

          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-400">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-sky-300 transition hover:text-sky-200"
            >
              Tạo tại đây
            </Link>
          </p>

          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="w-full text-sm text-slate-400 hover:text-white mt-3"
          >
            ← Về trang chủ
          </button>
        </form>
      </div>
    </div>
  );
}
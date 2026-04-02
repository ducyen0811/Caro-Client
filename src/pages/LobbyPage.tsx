import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket, getStoredUser } from "../lib/socket";

type MatchFoundPayload = {
  matchId: string;
  roomId: string;
  status: string;
  boardSize: number;
  winLength: number;
  currentTurn: "X" | "O";
  winnerId: string | null;
  endedType: string | null;
  winningCells: Array<{ x: number; y: number }>;
  players: Array<{
    matchPlayerId: string;
    userId: string;
    username: string;
    avatarUrl: string | null;
    role: "X" | "O";
    result: string | null;
  }>;
  moves: Array<{
    id: string;
    moveNumber: number;
    x: number;
    y: number;
    userId: string;
    role: "X" | "O";
    createdAt: string;
  }>;
};

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const socket = useMemo(() => getSocket(currentUser), [currentUser]);

  const [isFinding, setIsFinding] = useState(false);
  const [statusText, setStatusText] = useState("Sẵn sàng tìm trận");
  const [errorText, setErrorText] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const onConnect = () => {
      console.log("socket connected:", socket.id);
    };

    const onConnectError = (error: Error) => {
      console.error("socket connect error:", error);
      setIsFinding(false);
      setCountdown(null);
      setErrorText(`Không kết nối được socket: ${error.message}`);
      setStatusText("Mất kết nối tới máy chủ");
    };

    const onSearching = (data: { message?: string; expiresIn?: number }) => {
      setIsFinding(true);
      setErrorText("");
      setStatusText(data.message || "Đang tìm đối thủ...");
      setCountdown(typeof data.expiresIn === "number" ? data.expiresIn : 15);
    };

    const onTimeout = (data: { message?: string }) => {
      setIsFinding(false);
      setCountdown(null);
      setErrorText("");
      setStatusText(data.message || "Hết thời gian tìm trận");
    };

    const onMatchmakingError = (data: { message?: string }) => {
      setIsFinding(false);
      setCountdown(null);
      setErrorText(data.message || "Có lỗi khi tìm trận");
      setStatusText("Tìm trận thất bại");
    };

    const onMatchFound = (data: MatchFoundPayload) => {
      setIsFinding(false);
      setCountdown(null);
      setErrorText("");
      setStatusText("Đã tìm thấy trận, đang vào phòng...");

      localStorage.setItem("current_match", JSON.stringify(data));

      setTimeout(() => {
        navigate(`/match/${data.matchId}`);
      }, 300);
    };

    const onDisconnected = () => {
      if (isFinding) {
        setIsFinding(false);
        setCountdown(null);
        setStatusText("Socket đã ngắt kết nối");
      }
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnected);
    socket.on("matchmaking:searching", onSearching);
    socket.on("matchmaking:timeout", onTimeout);
    socket.on("matchmaking:error", onMatchmakingError);
    socket.on("match:found", onMatchFound);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnected);
      socket.off("matchmaking:searching", onSearching);
      socket.off("matchmaking:timeout", onTimeout);
      socket.off("matchmaking:error", onMatchmakingError);
      socket.off("match:found", onMatchFound);
    };
  }, [socket, navigate, isFinding]);

  useEffect(() => {
    if (!isFinding || countdown === null) return;

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isFinding, countdown]);

  const handleQuickMatch = () => {
    setErrorText("");

    if (!currentUser?.id) {
      setStatusText("Không tìm thấy thông tin đăng nhập");
      setErrorText("Bạn cần đăng nhập lại trước khi tìm trận");
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    setIsFinding(true);
    setStatusText("Đang gửi yêu cầu tìm trận...");
    setCountdown(15);

    socket.emit("matchmaking:join", {
      queueType: "CASUAL",
      boardSize: 15,
    });
  };

  const handleCancelMatchmaking = () => {
    socket.emit("matchmaking:cancel");
    setIsFinding(false);
    setCountdown(null);
    setErrorText("");
    setStatusText("Đã hủy tìm trận");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0d2b66,_#020617_60%)] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between rounded-b-2xl border border-white/10 bg-black/40 px-6 py-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-700 text-lg font-bold">
            C
          </div>
          <div>
            <div className="text-lg font-bold">Caro Galaxy</div>
            <div className="text-xs text-slate-300">Realtime PvP • Elo Ranking</div>
          </div>
        </div>

        <nav className="hidden gap-3 md:flex">
          <button className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
            Trang chủ
          </button>
          <button className="rounded-xl bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-300">
            Phòng đấu
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">{currentUser?.username || "Người chơi"}</div>
            <div className="text-sm font-semibold">Elo 1000</div>
          </div>
          <div className="h-11 w-11 rounded-full bg-sky-400/70" />
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur">
          <div className="mb-3 text-center text-3xl font-bold">Sảnh chờ</div>
          <div className="mb-8 text-center text-slate-300">
            {isFinding ? "Đang ghép trận với người chơi khác..." : "Nhấn nút bên dưới để tìm trận nhanh"}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-2 text-sm text-slate-300">Trạng thái</div>
            <div className="text-lg font-semibold text-white">{statusText}</div>

            {isFinding && countdown !== null && (
              <div className="mt-3 text-sm text-sky-300">
                Thời gian chờ còn lại: {countdown}s
              </div>
            )}

            {errorText && (
              <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorText}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleQuickMatch}
                disabled={isFinding}
                className={`flex h-14 flex-1 items-center justify-center rounded-2xl px-5 text-base font-bold transition ${
                  isFinding
                    ? "cursor-not-allowed bg-slate-700/80 text-slate-300"
                    : "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg hover:scale-[1.01]"
                }`}
              >
                {isFinding ? (
                  <span className="flex items-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang tìm trận...
                  </span>
                ) : (
                  "Tìm trận nhanh"
                )}
              </button>

              {isFinding && (
                <button
                  onClick={handleCancelMatchmaking}
                  className="h-14 rounded-2xl border border-white/15 bg-white/5 px-5 font-semibold text-white hover:bg-white/10"
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LobbyPage;
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { connectSocket } from "../lib/socket";

type RoomPlayer = {
  id: string;
  name: string;
  symbol: "X" | "O";
};

type RoomState = {
  roomCode: string;
  symbol: "X" | "O";
  players: RoomPlayer[];
  scores: Record<string, number>;
  board: string[];
  turn: "X" | "O";
  status: string;
};

const BOARD_SIZE = 15;
const CELL_SIZE = 38;

function buildEmptyBoard() {
  return Array.from({ length: 225 }, () => "");
}

function getWinningCells(board: string[]): number[] {
  const dirs: [number, number][] = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const current = board[y * BOARD_SIZE + x];
      if (!current) continue;

      for (const [dx, dy] of dirs) {
        const cells: number[] = [y * BOARD_SIZE + x];
        let ok = true;

        for (let step = 1; step < 5; step++) {
          const nx = x + dx * step;
          const ny = y + dy * step;

          if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) {
            ok = false;
            break;
          }

          const nextIndex = ny * BOARD_SIZE + nx;
          if (board[nextIndex] !== current) {
            ok = false;
            break;
          }

          cells.push(nextIndex);
        }

        if (ok) return cells;
      }
    }
  }

  return [];
}

function getWinLineStyle(cells: number[]) {
  if (cells.length < 2) return null;

  const first = cells[0];
  const last = cells[cells.length - 1];

  const firstRow = Math.floor(first / BOARD_SIZE);
  const firstCol = first % BOARD_SIZE;
  const lastRow = Math.floor(last / BOARD_SIZE);
  const lastCol = last % BOARD_SIZE;

  const x1 = firstCol * CELL_SIZE + CELL_SIZE / 2;
  const y1 = firstRow * CELL_SIZE + CELL_SIZE / 2;
  const x2 = lastCol * CELL_SIZE + CELL_SIZE / 2;
  const y2 = lastRow * CELL_SIZE + CELL_SIZE / 2;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return {
    left: `${x1}px`,
    top: `${y1}px`,
    width: `${length}px`,
    transform: `translateY(-50%) rotate(${angle}deg)`,
    transformOrigin: "left center" as const,
  };
}

export default function MatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { matchId } = useParams();

  const socket = useMemo(() => connectSocket(), []);
  const initialRoom = (location.state as { room?: RoomState } | null)?.room;

  const [state, setState] = useState<RoomState>(
    initialRoom || {
      roomCode: matchId || "",
      symbol: "X",
      players: [],
      scores: {},
      board: buildEmptyBoard(),
      turn: "X",
      status: "Đang chờ dữ liệu trận đấu...",
    }
  );

  const [message, setMessage] = useState(
    initialRoom ? "" : "Chưa có dữ liệu trận. Hãy vào trận từ Lobby."
  );
  const [showRematchModal, setShowRematchModal] = useState(false);
  const [rematchFrom, setRematchFrom] = useState("");
  const [waitingRematch, setWaitingRematch] = useState(false);

  useEffect(() => {
    const handleGameUpdate = (data: Partial<RoomState>) => {
      setState((prev) => ({ ...prev, ...data }));
      setMessage("");
      setShowRematchModal(false);
      setRematchFrom("");
      setWaitingRematch(false);
    };

    const handleScoreUpdate = (scores: Record<string, number>) => {
      setState((prev) => ({ ...prev, scores }));
    };

    const handlePlayerLeft = (payload?: { message?: string }) => {
      const nextMessage = payload?.message || "Đối thủ đã rời phòng.";
      setMessage(nextMessage);
      setState((prev) => ({ ...prev, status: nextMessage }));
      setShowRematchModal(false);
      setRematchFrom("");
      setWaitingRematch(false);
    };

    const handleRoomError = (err: { message?: string }) => {
      setMessage(err?.message || "Có lỗi xảy ra.");
    };

    const handleRematchRequested = (payload: { fromPlayerName: string }) => {
      setRematchFrom(payload.fromPlayerName);
      setShowRematchModal(true);
      setWaitingRematch(false);
    };

    const handleRematchPending = (payload?: { message?: string }) => {
      setWaitingRematch(true);
      setMessage(payload?.message || "Đang chờ đối thủ đồng ý chơi lại");
    };

    const handleRematchDeclined = (payload?: { message?: string }) => {
      setShowRematchModal(false);
      setRematchFrom("");
      setWaitingRematch(false);
      setMessage(payload?.message || "Đối thủ đã từ chối chơi lại");
    };

    const handleRematchStarted = (payload?: { message?: string }) => {
      setShowRematchModal(false);
      setRematchFrom("");
      setWaitingRematch(false);
      setMessage(payload?.message || "Ván mới bắt đầu");
    };

    socket.on("game:update", handleGameUpdate);
    socket.on("score:update", handleScoreUpdate);
    socket.on("player:left", handlePlayerLeft);
    socket.on("room:error", handleRoomError);
    socket.on("game:rematch-requested", handleRematchRequested);
    socket.on("game:rematch-pending", handleRematchPending);
    socket.on("game:rematch-declined", handleRematchDeclined);
    socket.on("game:rematch-started", handleRematchStarted);

    return () => {
      socket.off("game:update", handleGameUpdate);
      socket.off("score:update", handleScoreUpdate);
      socket.off("player:left", handlePlayerLeft);
      socket.off("room:error", handleRoomError);
      socket.off("game:rematch-requested", handleRematchRequested);
      socket.off("game:rematch-pending", handleRematchPending);
      socket.off("game:rematch-declined", handleRematchDeclined);
      socket.off("game:rematch-started", handleRematchStarted);
    };
  }, [socket]);

  const myPlayer = useMemo(() => {
    return state.players.find((p) => p.symbol === state.symbol) || null;
  }, [state.players, state.symbol]);

  const opponent = useMemo(() => {
    return state.players.find((p) => p.symbol !== state.symbol) || null;
  }, [state.players, state.symbol]);

  const isMyTurn = state.turn === state.symbol;
  const winningCells = useMemo(() => getWinningCells(state.board), [state.board]);
  const matchEnded = winningCells.length > 0 || state.board.every(Boolean);
  const winLineStyle = useMemo(() => getWinLineStyle(winningCells), [winningCells]);

  const handleCellClick = (index: number) => {
    if (!state.roomCode) return;
    if (!opponent) return;
    if (!isMyTurn) return;
    if (state.board[index]) return;
    if (matchEnded) return;

    socket.emit("game:move", {
      roomCode: state.roomCode,
      index,
    });
  };

  const handleRestart = () => {
    if (!state.roomCode) return;
    if (!opponent) return;

    socket.emit("game:rematch-request", {
      roomCode: state.roomCode,
    });
  };

  const handleAcceptRematch = () => {
    if (!state.roomCode) return;

    socket.emit("game:rematch-accept", {
      roomCode: state.roomCode,
    });
  };

  const handleDeclineRematch = () => {
    if (!state.roomCode) return;

    socket.emit("game:rematch-decline", {
      roomCode: state.roomCode,
    });
    setShowRematchModal(false);
    setRematchFrom("");
  };

  const handleLeave = () => {
    if (state.roomCode) {
      socket.emit("room:leave", {
        roomCode: state.roomCode,
      });
    }
    navigate("/lobby");
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="glass-panel p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
                Match
              </p>
              <h1 className="mt-2 text-2xl font-black text-white md:text-3xl">
                Phòng {state.roomCode || matchId}
              </h1>
              <p className="mt-2 text-sm text-slate-300">{state.status}</p>
              {message ? (
                <p className="mt-2 text-sm font-medium text-amber-300">
                  {message}
                </p>
              ) : null}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                disabled={!opponent || waitingRematch}
                className="rounded-2xl bg-sky-500 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {waitingRematch ? "Đang chờ..." : "Ván mới"}
              </button>
              <button
                onClick={handleLeave}
                className="rounded-2xl bg-red-500 px-4 py-2 font-semibold text-white"
              >
                Rời phòng
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[220px_1fr_220px]">
          <div className="glass-panel p-5">
            <p className="text-sm text-slate-400">Bạn</p>
            <h2 className="mt-2 text-xl font-bold text-white">
              {myPlayer?.name || "Người chơi"}
            </h2>
            <p className="mt-2 text-slate-300">
              Ký hiệu:{" "}
              <span className="font-bold text-sky-300">
                {myPlayer?.symbol || state.symbol}
              </span>
            </p>
            <p className="mt-2 text-slate-300">
              Điểm:{" "}
              <span className="font-bold text-white">
                {myPlayer ? state.scores[myPlayer.id] || 0 : 0}
              </span>
            </p>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Lượt hiện tại</p>
                <p className="text-lg font-bold text-white">{state.turn}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Trạng thái</p>
                <p className="text-lg font-bold text-white">
                  {!opponent
                    ? "Đang chờ đối thủ"
                    : matchEnded
                    ? "Ván đấu kết thúc"
                    : isMyTurn
                    ? "Đến lượt bạn"
                    : "Đến lượt đối thủ"}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <div
                className="relative grid overflow-hidden rounded-xl border border-slate-700 bg-slate-900"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
                }}
              >
                {state.board.map((cell, index) => {
                  const isWinningCell = winningCells.includes(index);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCellClick(index)}
                      disabled={
                        Boolean(cell) || !opponent || !isMyTurn || matchEnded
                      }
                      className={`relative h-[38px] w-[38px] border-r border-b border-slate-700 bg-slate-900 p-0 ${
                        isWinningCell ? "bg-cyan-400/10" : "hover:bg-slate-800"
                      }`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center">
                        {cell === "X" ? (
                          <span className="block w-[20px] text-center text-[20px] font-bold leading-none text-sky-300">
                            X
                          </span>
                        ) : cell === "O" ? (
                          <span className="block w-[20px] text-center text-[20px] font-bold leading-none text-pink-300">
                            O
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}

                {winLineStyle && (
                  <div
                    className="pointer-events-none absolute z-10 h-[4px] rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.95)]"
                    style={winLineStyle}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="glass-panel p-5">
            <p className="text-sm text-slate-400">Đối thủ</p>
            <h2 className="mt-2 text-xl font-bold text-white">
              {opponent?.name || "Đang chờ người chơi"}
            </h2>
            <p className="mt-2 text-slate-300">
              Ký hiệu:{" "}
              <span className="font-bold text-pink-300">
                {opponent?.symbol || "-"}
              </span>
            </p>
            <p className="mt-2 text-slate-300">
              Điểm:{" "}
              <span className="font-bold text-white">
                {opponent ? state.scores[opponent.id] || 0 : 0}
              </span>
            </p>
          </div>
        </section>
      </div>

      {showRematchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-white">
              Yêu cầu chơi lại
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {rematchFrom} muốn bắt đầu ván mới. Bạn có đồng ý không?
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAcceptRematch}
                className="flex-1 rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-white"
              >
                Đồng ý
              </button>
              <button
                onClick={handleDeclineRematch}
                className="flex-1 rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white hover:bg-white/15"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket";

type BoardCell = "X" | "O" | null;

type MatchState = {
  matchId: string;
  roomId: string;
  status: "WAITING" | "PLAYING" | "FINISHED" | "CANCELLED";
  boardSize: number;
  winLength: number;
  currentTurn: "X" | "O";
  winnerId: string | null;
  endedType: "WIN" | "DRAW" | "SURRENDER" | "TIMEOUT" | null;
  board: BoardCell[][];
  winningCells: Array<{ x: number; y: number }>;
  players: Array<{
    matchPlayerId: string;
    userId: string;
    username: string;
    avatarUrl?: string | null;
    role: "X" | "O";
    result?: "WIN" | "LOSS" | "DRAW" | null;
  }>;
};

export default function MatchPage() {
  const { matchId } = useParams();
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [message, setMessage] = useState("Đang tải trận...");
  const [me] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (!matchId) return;

    socket.emit("match:join_room", { matchId });

    const onState = (data: MatchState) => {
      setMatchState(data);
      setMessage("");
    };

    const onEnded = (data: {
      winnerId: string | null;
      endedType: string;
    }) => {
      if (data.endedType === "DRAW") {
        setMessage("Ván đấu hòa");
      } else if (data.winnerId && me?.id === data.winnerId) {
        setMessage("Bạn thắng");
      } else {
        setMessage("Bạn thua");
      }
    };

    const onError = (data: { message: string }) => {
      setMessage(data.message);
    };

    socket.on("match:state", onState);
    socket.on("match:ended", onEnded);
    socket.on("game:error", onError);

    return () => {
      socket.off("match:state", onState);
      socket.off("match:ended", onEnded);
      socket.off("game:error", onError);
    };
  }, [matchId, me?.id]);

  const myRole = useMemo(() => {
    return matchState?.players.find((p) => p.userId === me?.id)?.role ?? null;
  }, [matchState, me?.id]);

  const isMyTurn = matchState?.currentTurn === myRole && matchState?.status === "PLAYING";

  const winningSet = useMemo(() => {
    const set = new Set<string>();
    for (const cell of matchState?.winningCells ?? []) {
      set.add(`${cell.x}-${cell.y}`);
    }
    return set;
  }, [matchState?.winningCells]);

  const handleCellClick = (x: number, y: number) => {
    if (!matchState || !isMyTurn) return;
    if (matchState.board[y][x] !== null) return;

    socket.emit("game:move", {
      matchId: matchState.matchId,
      x,
      y,
    });
  };

  const handleSurrender = () => {
    if (!matchState) return;
    socket.emit("game:surrender", { matchId: matchState.matchId });
  };

  if (!matchState) {
    return <div style={{ padding: 24 }}>{message}</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Phòng đấu</h1>
      <p>Match ID: {matchState.matchId}</p>
      <p>Trạng thái: {matchState.status}</p>
      <p>Lượt hiện tại: {matchState.currentTurn}</p>
      <p>Vai trò của bạn: {myRole ?? "Không xác định"}</p>
      {message && <p>{message}</p>}

      <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
        {matchState.players.map((player) => (
          <div
            key={player.userId}
            style={{
              padding: 12,
              border: "1px solid #ccc",
              minWidth: 180,
            }}
          >
            <div><strong>{player.username}</strong></div>
            <div>Quân: {player.role}</div>
            <div>
              {matchState.currentTurn === player.role && matchState.status === "PLAYING"
                ? "Đang tới lượt"
                : ""}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${matchState.boardSize}, 36px)`,
          gap: 2,
          width: "fit-content",
          marginBottom: 16,
        }}
      >
        {matchState.board.map((row, y) =>
          row.map((cell, x) => {
            const isWinningCell = winningSet.has(`${x}-${y}`);

            return (
              <button
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                disabled={
                  matchState.status !== "PLAYING" ||
                  !isMyTurn ||
                  cell !== null
                }
                style={{
                  width: 36,
                  height: 36,
                  fontSize: 16,
                  fontWeight: "bold",
                  border: isWinningCell ? "2px solid red" : "1px solid #999",
                  background: isWinningCell ? "#ffe8e8" : "#fff",
                  cursor: "pointer",
                }}
              >
                {cell}
              </button>
            );
          })
        )}
      </div>

      {matchState.status === "PLAYING" && (
        <button onClick={handleSurrender}>Đầu hàng</button>
      )}
    </div>
  );
}
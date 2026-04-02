import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../lib/socket";

function getUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function LobbyPage() {
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);
  const socket = useMemo(() => connectSocket(), []);

  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState("Sẵn sàng");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    socket.emit("player:ready", {
      name: user.username,
    });
  }, [user, socket, navigate]);

  useEffect(() => {
    socket.on("match:found", (data) => {
      navigate(`/match/${data.roomCode}`, {
        state: { room: data },
      });
    });

    socket.on("room:created", (data) => {
      navigate(`/match/${data.roomCode}`, {
        state: { room: data },
      });
    });

    socket.on("room:joined", (data) => {
      navigate(`/match/${data.roomCode}`, {
        state: { room: data },
      });
    });

    socket.on("room:error", (err) => {
      setError(err.message);
    });

    return () => {
      socket.off("match:found");
      socket.off("room:created");
      socket.off("room:joined");
      socket.off("room:error");
    };
  }, [socket, navigate]);

  return (
    <div className="page-shell">
      <div className="max-w-xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold text-white">
          Lobby
        </h1>

        <p className="text-slate-300">
          Người chơi: <strong>{user?.username}</strong>
        </p>

        <button
          onClick={() => socket.emit("queue:join-random")}
          className="w-full bg-blue-500 p-3 rounded"
        >
          Tìm trận ngẫu nhiên
        </button>

        <button
          onClick={() => socket.emit("room:create-private")}
          className="w-full bg-green-500 p-3 rounded"
        >
          Tạo phòng riêng
        </button>

        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Mã phòng"
          className="w-full p-3 rounded bg-black text-white"
        />

        <button
          onClick={() =>
            socket.emit("room:join-private", { roomCode: joinCode })
          }
          className="w-full bg-purple-500 p-3 rounded"
        >
          Vào phòng
        </button>

        <p>{status}</p>
        <p className="text-red-400">{error}</p>
      </div>
    </div>
  );
}
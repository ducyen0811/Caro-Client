import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getStoredUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getSocket() {
  const user = getStoredUser();

  if (!socket) {
    socket = io("http://localhost:4000", {
      autoConnect: false,
      transports: ["websocket"],
      auth: {
        user,
      },
    });
  } else {
    socket.auth = { user };
  }

  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}
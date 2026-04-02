import { io, Socket } from "socket.io-client";

export type ClientUser = {
  id: string;
  username?: string;
  email?: string;
};

let socket: Socket | null = null;

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getStoredUser(): ClientUser | null {
  const candidates = [
    readJson<ClientUser>("user"),
    readJson<ClientUser>("auth_user"),
    readJson<ClientUser>("currentUser"),
  ];

  const found = candidates.find((item) => item?.id);
  return found ?? null;
}

export function getSocket(user?: ClientUser | null) {
  const finalUser = user ?? getStoredUser();

  if (!socket) {
    socket = io("http://localhost:4000", {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
      auth: {
        user: finalUser,
      },
    });
  } else {
    socket.auth = {
      ...(socket.auth || {}),
      user: finalUser,
    };
  }

  return socket;
}

export function resetSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
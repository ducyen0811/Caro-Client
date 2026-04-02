import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  autoConnect: false,
});

export function connectSocket(user: {
  id: string;
  username?: string;
  email?: string;
}) {
  socket.auth = { user };
  socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}
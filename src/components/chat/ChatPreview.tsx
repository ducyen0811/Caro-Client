const messages = [
  { id: 1, name: "Khanh", text: "Ván này đánh nhanh nhé", mine: false },
  { id: 2, name: "Bạn", text: "Ok, vào luôn.", mine: true },
  { id: 3, name: "Khanh", text: "Tôi đi X nha", mine: false },
];

export default function ChatPreview() {
  return (
    <div className="glass-panel flex h-full flex-col p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-white">Chat trận đấu</p>
        <p className="text-xs text-slate-400">Realtime sau này nối socket</p>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.mine
                ? "ml-auto bg-sky-400/20 text-sky-100"
                : "bg-white/5 text-slate-200"
            }`}
          >
            <p className="mb-1 text-xs font-semibold text-slate-400">
              {msg.name}
            </p>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="input-galaxy"
          placeholder="Nhập tin nhắn..."
          readOnly
        />
        <button className="btn-primary">Gửi</button>
      </div>
    </div>
  );
}
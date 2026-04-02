const players = [
  { name: "Duc", elo: 1472, win: 42 },
  { name: "Huy", elo: 1430, win: 37 },
  { name: "Khanh", elo: 1398, win: 34 },
  { name: "Long", elo: 1351, win: 30 },
];

export default function LeaderboardPreview() {
  return (
    <div className="glass-panel p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-white">Top Elo</p>
        <p className="text-xs text-slate-400">Bảng xếp hạng mẫu</p>
      </div>

      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={player.name}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-400/15 font-bold text-sky-200">
                #{index + 1}
              </div>
              <div>
                <p className="font-semibold text-white">{player.name}</p>
                <p className="text-xs text-slate-400">{player.win} trận thắng</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-cyan-200">{player.elo}</p>
              <p className="text-xs text-slate-400">Elo</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
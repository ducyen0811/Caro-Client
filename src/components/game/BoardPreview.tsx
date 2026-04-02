const cells = Array.from({ length: 100 }, (_, i) => i);

export default function BoardPreview() {
  return (
    <div className="glass-panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Bàn cờ</p>
          <p className="text-xs text-slate-400">Preview UI trận đấu</p>
        </div>
        <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-300">
          Lượt của X
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1 rounded-2xl bg-white/5 p-3">
        {cells.map((cell) => {
          const isX = [12, 23, 34, 45].includes(cell);
          const isO = [24, 35, 46].includes(cell);

          return (
            <div
              key={cell}
              className="aspect-square rounded-lg border border-white/5 bg-galaxy-900/80 transition hover:bg-galaxy-700/70"
            >
              <div className="flex h-full items-center justify-center text-lg font-bold">
                {isX && <span className="text-sky-300">X</span>}
                {isO && <span className="text-cyan-200">O</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}